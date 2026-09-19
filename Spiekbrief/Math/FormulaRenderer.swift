@preconcurrency import SwiftMath
import SwiftUI
import UIKit

/// A typeset formula, rasterized at the screen scale.
struct RenderedFormula: @unchecked Sendable {
    let image: UIImage
    /// Distance from the math baseline to the top and bottom of the image, in points.
    let ascent: CGFloat
    let descent: CGFloat
    var size: CGSize { image.size }
}

struct FormulaRenderError: Error, Sendable {
    let latex: String
    let message: String
}

/// What the views need from a renderer. Keeping this small lets us swap SwiftMath for
/// another typesetter without touching any view.
protocol FormulaRendering: Sendable {
    func cached(_ key: FormulaKey) -> RenderedFormula?
    func render(_ key: FormulaKey) async -> Result<RenderedFormula, FormulaRenderError>
    func renderNow(_ key: FormulaKey) -> Result<RenderedFormula, FormulaRenderError>
    func prewarm(_ keys: [FormulaKey])
}

struct FormulaKey: Hashable, Sendable {
    let latex: String
    let fontSize: CGFloat
    let dark: Bool
    /// `.display` for block formulas, `.text` for formulas inside a sentence.
    let inline: Bool

    init(latex: String, fontSize: CGFloat, dark: Bool, inline: Bool = false) {
        self.latex = latex
        // Round so that tiny Dynamic Type differences share cache entries.
        self.fontSize = (fontSize * 2).rounded() / 2
        self.dark = dark
        self.inline = inline
    }

    fileprivate var cacheKey: NSString {
        "\(fontSize)|\(dark ? 1 : 0)|\(inline ? 1 : 0)|\(latex)" as NSString
    }
}

/// Renders LaTeX with SwiftMath into images and caches them.
///
/// Why images instead of a live `MTMathUILabel` per row: a SwiftUI `Image` is the cheapest view
/// there is, scrolls without layout work, and avoids a UIKit view per formula in long lists.
/// Why not a web view (KaTeX/MathJax): every WKWebView costs a WebContent process and lays out
/// asynchronously, which makes list rows jump — too expensive on an iPhone 12 mini.
///
/// `NSCache` is thread-safe, so cache hits are served synchronously on the main thread (no
/// placeholder flash); misses are typeset on a background task. SwiftMath's `MathImage` and
/// its font loading are thread-safe.
final class FormulaRenderer: FormulaRendering, @unchecked Sendable {
    static let shared = FormulaRenderer()

    private final class Box {
        let value: RenderedFormula
        init(_ value: RenderedFormula) { self.value = value }
    }

    private let cache: NSCache<NSString, Box> = {
        let cache = NSCache<NSString, Box>()
        // Roughly 12 MB of bitmaps; a formula image is typically 10–60 KB at 3x.
        cache.totalCostLimit = 12 * 1024 * 1024
        return cache
    }()

    func cached(_ key: FormulaKey) -> RenderedFormula? {
        cache.object(forKey: key.cacheKey)?.value
    }

    func render(_ key: FormulaKey) async -> Result<RenderedFormula, FormulaRenderError> {
        if let hit = cached(key) { return .success(hit) }
        let result = await Task.detached(priority: .userInitiated) {
            Self.typeset(key)
        }.value
        if case .success(let rendered) = result { store(rendered, for: key) }
        return result
    }

    /// Synchronous variant for inline math and tests. Also caches.
    func renderNow(_ key: FormulaKey) -> Result<RenderedFormula, FormulaRenderError> {
        if let hit = cached(key) { return .success(hit) }
        let result = Self.typeset(key)
        if case .success(let rendered) = result { store(rendered, for: key) }
        return result
    }

    /// Typesets a batch in the background so a topic's formulas are ready before they scroll in.
    func prewarm(_ keys: [FormulaKey]) {
        let missing = keys.filter { cached($0) == nil }
        guard !missing.isEmpty else { return }
        Task.detached(priority: .utility) { [self] in
            for key in missing where cached(key) == nil {
                if case .success(let rendered) = Self.typeset(key) { store(rendered, for: key) }
            }
        }
    }

    /// Loads the math font and its tables once, so the first real formula renders quickly.
    func warmUpFont() {
        Task.detached(priority: .utility) {
            _ = Self.typeset(FormulaKey(latex: "x^2+\\frac{1}{2}", fontSize: 20, dark: false))
        }
    }

    private func store(_ rendered: RenderedFormula, for key: FormulaKey) {
        let cost = Int(rendered.size.width * rendered.size.height * rendered.image.scale * rendered.image.scale * 4)
        cache.setObject(Box(rendered), forKey: key.cacheKey, cost: cost)
    }

    static func textColor(dark: Bool) -> UIColor {
        UIColor.label.resolvedColor(with: UITraitCollection(userInterfaceStyle: dark ? .dark : .light))
    }

    private static func typeset(_ key: FormulaKey) -> Result<RenderedFormula, FormulaRenderError> {
        let latex = LatexPreprocessor.process(key.latex)
        var math = MathImage(
            latex: latex,
            fontSize: key.fontSize,
            textColor: textColor(dark: key.dark),
            labelMode: key.inline ? .text : .display,
            textAlignment: .left
        )
        math.font = .latinModernFont
        let (error, image, layout) = math.asImage()
        guard error == nil, let image, let layout else {
            return .failure(FormulaRenderError(latex: key.latex, message: error?.localizedDescription ?? "Onbekende fout"))
        }
        return .success(RenderedFormula(image: image, ascent: layout.ascent, descent: layout.descent))
    }
}

extension EnvironmentValues {
    @Entry var formulaRenderer: any FormulaRendering = FormulaRenderer.shared
}
