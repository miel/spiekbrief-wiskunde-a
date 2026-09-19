import Foundation
import Testing
@testable import Spiekbrief

/// Typesets every formula in the bundled content. A LaTeX typo would otherwise only show up
/// as a red fallback on the screen where it happens.
@Suite("Formules")
struct FormulaLintTests {
    let store = ContentStore.load()
    let renderer = FormulaRenderer.shared

    /// Content width on an iPhone 12 mini: 375 pt minus 2 × 16 pt padding.
    static let screenWidth: CGFloat = 343
    /// Above this, a formula scrolls horizontally. Fine, but worth knowing about.
    static let comfortableWidth: CGFloat = 320

    private var allFormulas: [(topic: String, formula: Formula)] {
        store.domains.flatMap(\.topics).flatMap { topic in topic.formulas.map { (topic.id, $0) } }
    }

    /// Inline math (between $…$) from every text in the content.
    private var allInlineMath: [(where: String, latex: String)] {
        var result: [(String, String)] = []
        for domain in store.domains {
            for topic in domain.topics {
                var texts = [topic.summary]
                for block in topic.blocks {
                    switch block {
                    case .text(let s), .heading(let s), .tip(let s), .warning(let s):
                        texts.append(s)
                    case .formula(let f):
                        texts.append(contentsOf: [f.caption, f.condition, f.question].compactMap { $0 })
                    case .example(let e):
                        texts.append(e.problem)
                        texts.append(contentsOf: e.steps.map(\.text))
                    case .numworks(let n):
                        texts.append(contentsOf: n.steps)
                        if let note = n.note { texts.append(note) }
                    case .table(let t):
                        texts.append(contentsOf: t.headers + t.rows.flatMap { $0 } + [t.caption].compactMap { $0 })
                    case .graph:
                        break
                    }
                }
                for text in texts {
                    let parts = text.components(separatedBy: "$")
                    #expect(parts.count % 2 == 1, "\(topic.id): oneven aantal $-tekens")
                    for latex in parts.enumerated().filter({ $0.offset % 2 == 1 }).map({ $0.element }) {
                        result.append((topic.id, latex))
                    }
                }
            }
        }
        return result
    }

    @Test("Elke formule wordt correct gezet")
    func everyFormulaTypesets() {
        for (topic, formula) in allFormulas {
            let key = FormulaKey(latex: formula.latex, fontSize: 20, dark: false)
            switch renderer.renderNow(key) {
            case .success(let rendered):
                #expect(rendered.size.width > 0 && rendered.size.height > 0, "\(topic)/\(formula.id) is leeg")
            case .failure(let error):
                Issue.record("\(topic)/\(formula.id): \(error.message) — \(formula.latex)")
            }
        }
    }

    @Test("Elke inline formule wordt correct gezet")
    func everyInlineFormulaTypesets() {
        for (location, latex) in allInlineMath {
            let key = FormulaKey(latex: latex, fontSize: 17, dark: false, inline: true)
            if case .failure(let error) = renderer.renderNow(key) {
                Issue.record("\(location): \(error.message) — $\(latex)$")
            }
        }
    }

    @Test("Geen enkele formule is absurd breed")
    func formulaWidths() {
        var wide: [(String, CGFloat)] = []
        for (topic, formula) in allFormulas {
            guard case .success(let rendered) = renderer.renderNow(FormulaKey(latex: formula.latex, fontSize: 20, dark: false))
            else { continue }
            let width = rendered.size.width
            // Wider than about 3 screens means the formula should be split over lines
            // with \begin{aligned} … \end{aligned}.
            #expect(width < 3 * Self.screenWidth, "\(topic)/\(formula.id) is \(Int(width)) pt breed")
            if width > Self.comfortableWidth { wide.append(("\(topic)/\(formula.id)", width)) }
        }
        if !wide.isEmpty {
            let list = wide.sorted { $0.1 > $1.1 }.map { "\($0.0) \(Int($0.1)) pt" }.joined(separator: ", ")
            print("Scrollen nodig op een 12 mini (breder dan \(Int(Self.comfortableWidth)) pt): \(list)")
        }
    }

    @Test("De cache levert hetzelfde beeld terug")
    func cacheReturnsSameImage() throws {
        let key = FormulaKey(latex: "a^2 + b^2", fontSize: 20, dark: false)
        let first = try #require(try? renderer.renderNow(key).get())
        let cached = try #require(renderer.cached(key))
        #expect(first.image === cached.image)
    }

    @Test("Donker en licht leveren verschillende beelden op")
    func darkModeRendersSeparately() throws {
        let light = try #require(try? renderer.renderNow(FormulaKey(latex: "x+1", fontSize: 20, dark: false)).get())
        let dark = try #require(try? renderer.renderNow(FormulaKey(latex: "x+1", fontSize: 20, dark: true)).get())
        #expect(light.image !== dark.image)
        #expect(light.size == dark.size)
    }
}
