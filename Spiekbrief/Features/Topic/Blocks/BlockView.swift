import SwiftUI

struct BlockView: View {
    let block: Block

    var body: some View {
        switch block {
        case .text(let text):
            MathText(text)
        case .heading(let text):
            Text(text)
                .font(.title3.bold())
                .padding(.top, 8)
                .accessibilityAddTraits(.isHeader)
        case .formula(let formula):
            FormulaCard(formula: formula)
        case .example(let example):
            ExampleView(example: example)
        case .numworks(let tip):
            NumWorksTipView(tip: tip)
        case .graph(let id):
            GraphBlockView(graphID: id)
        case .table(let table):
            TableBlockView(table: table)
        case .tip(let text):
            CalloutView(text: text, kind: .tip)
        case .warning(let text):
            CalloutView(text: text, kind: .warning)
        }
    }
}

/// Rounded card used by all block types that need a background.
struct CardBackground: ViewModifier {
    var tint: Color?

    func body(content: Content) -> some View {
        content
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.secondarySystemGroupedBackground), in: .rect(cornerRadius: 12))
            .overlay {
                if let tint {
                    RoundedRectangle(cornerRadius: 12).strokeBorder(tint.opacity(0.35), lineWidth: 1)
                }
            }
    }
}

extension View {
    func card(tint: Color? = nil) -> some View { modifier(CardBackground(tint: tint)) }
}
