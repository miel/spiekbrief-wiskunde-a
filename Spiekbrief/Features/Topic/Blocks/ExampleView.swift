import SwiftUI

/// Worked example: the problem first, then the steps one tap at a time, so the student can
/// try the next step before looking.
struct ExampleView: View {
    let example: Example
    @State private var revealed = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label(example.title, systemImage: "pencil.and.list.clipboard")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.tint)
            MathText(example.problem)

            ForEach(0..<revealed, id: \.self) { index in
                let step = example.steps[index]
                HStack(alignment: .firstTextBaseline, spacing: 10) {
                    Text("\(index + 1)")
                        .font(.caption.weight(.bold).monospacedDigit())
                        .foregroundStyle(.white)
                        .frame(width: 22, height: 22)
                        .background(.tint, in: .circle)
                        .accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: 6) {
                        MathText(step.text)
                        if let latex = step.latex {
                            FormulaBlockView(formula: Formula(
                                id: "\(example.title)-\(index)", latex: latex,
                                spoken: LatexSpeech.approximate(latex), badge: .extra))
                        }
                    }
                }
                .accessibilityElement(children: .combine)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            HStack {
                if revealed < example.steps.count {
                    Button(revealed == 0 ? "Toon eerste stap" : "Volgende stap") {
                        withAnimation(.snappy) { revealed += 1 }
                    }
                    .buttonStyle(.borderedProminent)
                    Button("Alles") {
                        withAnimation(.snappy) { revealed = example.steps.count }
                    }
                    .buttonStyle(.bordered)
                } else {
                    Button("Verberg uitwerking") {
                        withAnimation(.snappy) { revealed = 0 }
                    }
                    .buttonStyle(.bordered)
                }
            }
            .controlSize(.regular)
        }
        .card()
    }
}
