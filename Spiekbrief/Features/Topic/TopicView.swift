import SwiftUI

/// One topic: its blocks in a lazy stack, so graphs and off-screen formulas only load when
/// they scroll into view.
struct TopicView: View {
    let topicID: String
    var scrollTo: String?

    @Environment(\.content) private var content
    @Environment(\.formulaRenderer) private var renderer
    @Environment(\.colorScheme) private var colorScheme
    @ScaledMetric(relativeTo: .body) private var formulaSize: CGFloat = 20

    var body: some View {
        if let topic = content.topic(id: topicID) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 16) {
                        header(topic)
                        ForEach(topic.blocks.indices, id: \.self) { index in
                            let block = topic.blocks[index]
                            BlockView(block: block)
                                .id(block.anchorID)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 32)
                }
                .background(Color(.systemGroupedBackground))
                .navigationTitle(topic.title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        FavoriteButton(itemID: topic.id, kind: .topic)
                    }
                }
                .onAppear { prewarm(topic) }
                .task {
                    guard let scrollTo else { return }
                    // The target row may not exist yet in the lazy stack, so try again shortly.
                    for delay in [10, 250] {
                        try? await Task.sleep(for: .milliseconds(delay))
                        withAnimation { proxy.scrollTo(scrollTo, anchor: .top) }
                    }
                }
            }
        } else {
            ContentUnavailableView("Onderwerp niet gevonden", systemImage: "questionmark.folder")
        }
    }

    private func header(_ topic: Topic) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            if let domain = content.domain(forTopic: topic.id) {
                HStack(spacing: 6) {
                    Image(systemName: domain.symbol).foregroundStyle(domain.tint)
                    Text("\(domain.code) · Syllabus \(topic.syllabusRef)")
                    if domain.schoolExamOnly { BadgeLabel(badge: .se, compact: true) }
                }
                .font(.footnote.weight(.medium))
                .foregroundStyle(.secondary)
                .accessibilityElement(children: .combine)
            }
            Text(topic.title)
                .font(.title2.bold())
                .accessibilityAddTraits(.isHeader)
            MathText(topic.summary)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 8)
    }

    /// Typesets the topic's formulas in the background before they scroll in.
    private func prewarm(_ topic: Topic) {
        let size = min(formulaSize, FormulaView.maxFontSize)
        let dark = colorScheme == .dark
        renderer.prewarm(topic.formulas.map { FormulaKey(latex: $0.latex, fontSize: size, dark: dark) })
    }
}

extension Block {
    /// Scroll anchor: formulas can be linked from search and favorites.
    var anchorID: String? {
        if case .formula(let formula) = self { formula.id } else { nil }
    }
}
