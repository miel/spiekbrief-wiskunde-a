import SwiftUI

/// Key presses on the NumWorks, as available in the NL examenstand.
struct NumWorksTipView: View {
    let tip: NumWorksTip

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "function")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 26, height: 26)
                    .background(.yellow.gradient, in: .rect(cornerRadius: 6))
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 0) {
                    Text("Op de NumWorks")
                        .font(.subheadline.weight(.semibold))
                    Text("App: \(tip.app)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .accessibilityElement(children: .combine)

            VStack(alignment: .leading, spacing: 6) {
                ForEach(tip.steps.indices, id: \.self) { index in
                    let step = tip.steps[index]
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text("\(index + 1).")
                            .font(.callout.monospacedDigit())
                            .foregroundStyle(.secondary)
                        MathText(step, style: .callout)
                    }
                    .accessibilityElement(children: .combine)
                }
            }
            if let note = tip.note {
                MathText(note, style: .footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .card(tint: .yellow)
    }
}
