import SwiftUI
import UIKit

/// A display formula. It follows Dynamic Type (capped, so huge text sizes scroll instead of
/// wrapping) and dark mode, and is read by VoiceOver as `spoken`.
struct FormulaView: View {
    let latex: String
    var spoken: String?
    /// Fixed font size, used by the zoomable detail view. `nil` follows Dynamic Type.
    var fontSize: CGFloat?

    /// Largest size that Dynamic Type may scale a formula to; wider formulas scroll sideways.
    static let maxFontSize: CGFloat = 34

    /// Accessibility identifiers, read by the UI tests.
    static let placeholderID = "formula-placeholder"
    static let renderedID = "formula-rendered"

    @ScaledMetric(relativeTo: .body) private var scaledSize: CGFloat = 20
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.formulaRenderer) private var renderer

    @State private var rendered: (key: FormulaKey, formula: RenderedFormula)?
    @State private var failed: FormulaKey?

    private var key: FormulaKey {
        FormulaKey(latex: latex, fontSize: fontSize ?? min(scaledSize, Self.maxFontSize), dark: colorScheme == .dark)
    }

    var body: some View {
        let key = self.key
        // A synchronous cache hit avoids a placeholder frame when rows scroll back in. While a new
        // key renders (a graph's live formula changes on every slider tick) the previous image
        // stays up instead of flashing the placeholder.
        let formula = renderer.cached(key) ?? rendered?.formula
        Group {
            if let formula {
                Image(uiImage: formula.image)
            } else if failed == key {
                // Should never ship: FormulaLintTests renders every formula in the content.
                Text(verbatim: latex)
                    .font(.callout.monospaced())
                    .foregroundStyle(.red)
            } else {
                Color.clear.frame(width: 1, height: key.fontSize * 1.6)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(spoken ?? LatexSpeech.approximate(latex))
        // Lets FormulaRenderingUITests see whether a row is still waiting on its image. The
        // placeholder is the full card width, so its frame alone does not give this away.
        .accessibilityIdentifier(formula == nil ? Self.placeholderID : Self.renderedID)
        .task(id: key) {
            // Always publish the result, cache hit included: `body` reads the cache directly, but
            // that read is not a SwiftUI dependency. `TopicView` prewarms a whole topic on appear,
            // so by the time this runs the key is usually already cached — returning early then
            // leaves the row on its placeholder for good, because nothing re-renders it.
            if let hit = renderer.cached(key) {
                rendered = (key, hit)
                return
            }
            switch await renderer.render(key) {
            case .success(let formula): rendered = (key, formula)
            case .failure: failed = key
            }
        }
    }
}

/// A formula that scrolls horizontally when it is wider than the screen, and opens a
/// zoomable full-screen view on tap.
struct FormulaBlockView: View {
    let formula: Formula
    @State private var showDetail = false

    var body: some View {
        ViewThatFits(in: .horizontal) {
            formulaView
            ScrollView(.horizontal) { formulaView.padding(.trailing, 16) }
                .scrollIndicators(.visible)
                .mask(fadeMask)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .contentShape(.rect)
        .onTapGesture { showDetail = true }
        .accessibilityAddTraits(.isButton)
        .accessibilityHint("Tik om te vergroten")
        .fullScreenCover(isPresented: $showDetail) {
            FormulaDetailView(formula: formula)
        }
    }

    private var formulaView: some View {
        FormulaView(latex: formula.latex, spoken: formula.spoken)
    }

    private var fadeMask: some View {
        HStack(spacing: 0) {
            Color.black
            LinearGradient(colors: [.black, .clear], startPoint: .leading, endPoint: .trailing)
                .frame(width: 16)
        }
    }
}
