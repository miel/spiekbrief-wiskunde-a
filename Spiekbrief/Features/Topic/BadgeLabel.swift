import SwiftUI

/// Shows how a formula counts at the exam: on the formula sheet, to know by heart, SE only, or extra.
struct BadgeLabel: View {
    let badge: Badge
    var compact = false

    var body: some View {
        // Text stays `.primary` for contrast (system green/orange text on a light background is
        // below 3:1); only the icon and the background carry the color.
        HStack(spacing: 4) {
            Image(systemName: badge.symbol)
                .foregroundStyle(badge.color)
            Text(compact ? badge.shortLabel : badge.label)
        }
        .font(compact ? .caption2.weight(.semibold) : .caption.weight(.semibold))
        .padding(.horizontal, compact ? 6 : 8)
        .padding(.vertical, compact ? 2 : 4)
        .background(badge.color.opacity(0.16), in: .capsule)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(badge.label)
    }
}

extension Badge {
    var color: Color {
        switch self {
        case .formulelijst: .green
        case .paraat: .orange
        case .se: .blue
        case .extra: .gray
        }
    }

    var shortLabel: String {
        switch self {
        case .formulelijst: "Formulelijst"
        case .paraat: "Paraat"
        case .se: "SE"
        case .extra: "Extra"
        }
    }
}
