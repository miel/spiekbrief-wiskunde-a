import SwiftUI
import UIKit

/// Body text with inline Markdown and inline math between `$…$`.
///
/// Math segments are typeset in text style and inserted as images into one `Text`, so line
/// wrapping stays native. Each image is shifted down by its descent so the math baseline lines
/// up with the text baseline. Inline formulas are small, so they are typeset synchronously.
struct MathText: View {
    let source: String
    let style: Font.TextStyle
    let weight: Font.Weight?

    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.formulaRenderer) private var renderer

    init(_ source: String, style: Font.TextStyle = .body, weight: Font.Weight? = nil) {
        self.source = source
        self.style = style
        self.weight = weight
    }

    var body: some View {
        text
            .font(.system(style, weight: weight))
            .accessibilityLabel(Text(verbatim: spokenText))
    }

    /// Point size of the text style at the current Dynamic Type size, so math matches the text.
    private var fontSize: CGFloat {
        let traits = UITraitCollection(preferredContentSizeCategory: dynamicTypeSize.contentSizeCategory)
        return UIFont.preferredFont(forTextStyle: style.uiTextStyle, compatibleWith: traits).pointSize
    }

    private var segments: [(isMath: Bool, text: String)] {
        source.split(separator: "$", omittingEmptySubsequences: false)
            .enumerated()
            .map { ($0.offset % 2 == 1, String($0.element)) }
            .filter { !$0.text.isEmpty }
    }

    private var text: Text {
        segments.reduce(Text(verbatim: "")) { result, segment in
            let next: Text
            if segment.isMath {
                let key = FormulaKey(latex: segment.text, fontSize: fontSize, dark: colorScheme == .dark, inline: true)
                switch renderer.renderNow(key) {
                case .success(let formula):
                    // Template rendering: the glyphs take the text's foreground style (e.g. `.secondary`).
                    next = Text(Image(uiImage: formula.image).renderingMode(.template)).baselineOffset(-formula.descent)
                case .failure:
                    next = Text(verbatim: segment.text).italic()
                }
            } else {
                next = Text(Self.markdown(segment.text))
            }
            return Text("\(result)\(next)")
        }
    }

    private var spokenText: String {
        segments.map { $0.isMath ? LatexSpeech.approximate($0.text) : Self.plain($0.text) }.joined()
    }

    static func markdown(_ text: String) -> AttributedString {
        (try? AttributedString(
            markdown: text,
            options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace)
        )) ?? AttributedString(text)
    }

    static func plain(_ text: String) -> String {
        String(markdown(text).characters)
    }
}

private extension DynamicTypeSize {
    var contentSizeCategory: UIContentSizeCategory {
        switch self {
        case .xSmall: .extraSmall
        case .small: .small
        case .medium: .medium
        case .large: .large
        case .xLarge: .extraLarge
        case .xxLarge: .extraExtraLarge
        case .xxxLarge: .extraExtraExtraLarge
        case .accessibility1: .accessibilityMedium
        case .accessibility2: .accessibilityLarge
        case .accessibility3: .accessibilityExtraLarge
        case .accessibility4: .accessibilityExtraExtraLarge
        case .accessibility5: .accessibilityExtraExtraExtraLarge
        @unknown default: .large
        }
    }
}

private extension Font.TextStyle {
    var uiTextStyle: UIFont.TextStyle {
        switch self {
        case .largeTitle: .largeTitle
        case .title: .title1
        case .title2: .title2
        case .title3: .title3
        case .headline: .headline
        case .subheadline: .subheadline
        case .callout: .callout
        case .footnote: .footnote
        case .caption: .caption1
        case .caption2: .caption2
        default: .body
        }
    }
}
