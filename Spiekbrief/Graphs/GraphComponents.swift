import SwiftUI

/// Slider with a math label and the current value, used by all interactive graphs.
struct ParameterSlider: View {
    let name: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let step: Double
    var digits = 2

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                MathText(name, style: .footnote)
                Spacer()
                Text(GraphFormat.number(value, digits: digits))
                    .font(.footnote.monospacedDigit())
                    .foregroundStyle(.secondary)
            }
            Slider(value: $value, in: range, step: step)
                .accessibilityLabel(Text(verbatim: MathText.plain(name.replacingOccurrences(of: "$", with: ""))))
                .accessibilityValue(GraphFormat.number(value, digits: digits))
        }
    }
}

/// Card around an interactive graph with an "expand" button that opens it full screen,
/// where landscape is allowed.
struct GraphBlockView: View {
    let graphID: String
    @State private var expanded = false

    var body: some View {
        if let definition = GraphLibrary.definition(graphID) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("Interactieve grafiek", systemImage: "chart.xyaxis.line")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Spacer()
                    Button("Vergroot", systemImage: "arrow.up.left.and.arrow.down.right") { expanded = true }
                        .labelStyle(.iconOnly)
                        .buttonStyle(.borderless)
                        .frame(minWidth: 44, minHeight: 44)
                }
                .padding(.vertical, -10)
                GraphContent(definition: definition, chartHeight: 220)
            }
            .card()
            .fullScreenCover(isPresented: $expanded) {
                ExpandedGraphView(definition: definition)
            }
        } else {
            CalloutView(text: "Grafiek „\(graphID)” ontbreekt.", kind: .warning)
        }
    }
}

private struct ExpandedGraphView: View {
    let definition: GraphDefinition
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView {
                    GraphContent(definition: definition, chartHeight: max(260, geometry.size.height * 0.6))
                        .padding(16)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Klaar") { dismiss() } }
            }
        }
        .allowsLandscape()
    }
}

struct GraphContent: View {
    let definition: GraphDefinition
    let chartHeight: CGFloat

    var body: some View {
        switch definition {
        case .function(let graph): FunctionGraphView(graph: graph, chartHeight: chartHeight)
        case .increaseDiagram: IncreaseDiagramView(chartHeight: chartHeight)
        case .recursiveSequence: RecursiveSequenceView(chartHeight: chartHeight)
        case .normal: NormalDistributionView(chartHeight: chartHeight)
        case .binomial: BinomialDistributionView(chartHeight: chartHeight)
        }
    }
}

/// Colors for the curves of one graph, in order.
enum GraphPalette {
    static let colors: [Color] = [.blue, .orange, .green, .purple]
    static func color(_ index: Int) -> Color { colors[index % colors.count] }
}
