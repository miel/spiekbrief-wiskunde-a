import SwiftUI

struct TableBlockView: View {
    let table: TableData

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let caption = table.caption {
                MathText(caption, style: .subheadline, weight: .semibold)
            }
            // Tables in the content are narrow (2–4 columns); scroll sideways at large text sizes.
            ScrollView(.horizontal) {
                Grid(alignment: .leading, horizontalSpacing: 14, verticalSpacing: 8) {
                    GridRow {
                        ForEach(table.headers.indices, id: \.self) { column in
                            MathText(table.headers[column], style: .footnote, weight: .semibold)
                        }
                    }
                    Divider()
                    ForEach(table.rows.indices, id: \.self) { rowIndex in
                        let row = table.rows[rowIndex]
                        GridRow {
                            ForEach(row.indices, id: \.self) { column in
                                MathText(row[column], style: .callout)
                            }
                        }
                    }
                }
            }
            .scrollBounceBehavior(.basedOnSize, axes: .horizontal)
        }
        .card()
    }
}

struct CalloutView: View {
    enum Kind { case tip, warning }

    let text: String
    let kind: Kind

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 10) {
            Image(systemName: kind == .tip ? "lightbulb.fill" : "exclamationmark.triangle.fill")
                .foregroundStyle(kind == .tip ? .yellow : .orange)
                .accessibilityLabel(kind == .tip ? "Tip" : "Let op")
            MathText(text, style: .callout)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background((kind == .tip ? Color.yellow : Color.orange).opacity(0.12), in: .rect(cornerRadius: 12))
        .accessibilityElement(children: .combine)
    }
}
