import SwiftUI
import UIKit

/// Full-screen view of one formula: pinch to zoom, rotate to landscape for long formulas.
struct FormulaDetailView: View {
    let formula: Formula

    @Environment(\.dismiss) private var dismiss
    /// Committed zoom; the formula is re-typeset at this size so it stays sharp.
    @State private var zoom: CGFloat = 1
    /// Live zoom during the pinch, applied as a cheap scale effect.
    @GestureState private var pinch: CGFloat = 1

    private static let baseSize: CGFloat = 32
    private static let zoomRange: ClosedRange<CGFloat> = 0.6...3

    var body: some View {
        NavigationStack {
            ScrollView([.horizontal, .vertical]) {
                VStack(alignment: .leading, spacing: 16) {
                    FormulaView(latex: formula.latex, spoken: formula.spoken, fontSize: Self.baseSize * zoom)
                        .scaleEffect(pinch, anchor: .topLeading)
                    if let condition = formula.condition {
                        Text("Voorwaarde: \(condition)")
                            .font(.callout)
                            .foregroundStyle(.secondary)
                    }
                    BadgeLabel(badge: formula.badge)
                }
                .padding(24)
            }
            .gesture(
                MagnifyGesture()
                    .updating($pinch) { value, state, _ in state = value.magnification }
                    .onEnded { value in
                        zoom = min(max(zoom * value.magnification, Self.zoomRange.lowerBound), Self.zoomRange.upperBound)
                    }
            )
            .navigationTitle(Text(verbatim: formula.caption.map { MathText.plain($0.replacingOccurrences(of: "$", with: "")) } ?? "Formule"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Klaar") { dismiss() }
                }
                ToolbarItemGroup(placement: .bottomBar) {
                    Button("Kleiner", systemImage: "minus.magnifyingglass") {
                        zoom = max(zoom / 1.25, Self.zoomRange.lowerBound)
                    }
                    Spacer()
                    Button("Groter", systemImage: "plus.magnifyingglass") {
                        zoom = min(zoom * 1.25, Self.zoomRange.upperBound)
                    }
                }
            }
        }
        .allowsLandscape()
    }
}
