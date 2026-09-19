import SwiftUI
import UIKit

struct FormulaCard: View {
    let formula: Formula

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                if let caption = formula.caption {
                    MathText(caption, style: .subheadline, weight: .semibold)
                }
                Spacer(minLength: 8)
                FavoriteButton(itemID: formula.id, kind: .formula)
                    .labelStyle(.iconOnly)
                    .buttonStyle(.borderless)
                    .frame(minWidth: 44, minHeight: 44)
            }
            .padding(.bottom, -8)
            FormulaBlockView(formula: formula)
            if let condition = formula.condition {
                MathText("Voorwaarde: \(condition)", style: .footnote)
                    .foregroundStyle(.secondary)
            }
            BadgeLabel(badge: formula.badge)
        }
        .card(tint: formula.badge == .formulelijst ? Badge.formulelijst.color : nil)
        .contextMenu {
            ShareFormulaButton(formula: formula)
            Button("Kopieer LaTeX", systemImage: "doc.on.doc") {
                UIPasteboard.general.string = formula.latex
            }
        }
    }
}

/// Share link with a large, light-mode image of the formula on white, independent of the
/// current theme. A separate view, so the image is only rendered when the menu opens.
private struct ShareFormulaButton: View {
    let formula: Formula
    @Environment(\.formulaRenderer) private var renderer

    var body: some View {
        if case .success(let rendered) = renderer.renderNow(FormulaKey(latex: formula.latex, fontSize: 40, dark: false)) {
            let image = Image(uiImage: Self.onWhite(rendered.image))
            ShareLink(item: image, preview: SharePreview(formula.caption ?? "Formule", image: image)) {
                Label("Deel als afbeelding", systemImage: "square.and.arrow.up")
            }
        }
    }

    static func onWhite(_ image: UIImage, padding: CGFloat = 24) -> UIImage {
        let size = CGSize(width: image.size.width + 2 * padding, height: image.size.height + 2 * padding)
        let format = UIGraphicsImageRendererFormat()
        format.scale = image.scale
        return UIGraphicsImageRenderer(size: size, format: format).image { context in
            UIColor.white.setFill()
            context.fill(CGRect(origin: .zero, size: size))
            image.draw(at: CGPoint(x: padding, y: padding))
        }
    }
}
