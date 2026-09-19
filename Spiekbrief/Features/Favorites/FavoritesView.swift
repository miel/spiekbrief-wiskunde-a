import SwiftData
import SwiftUI

struct FavoritesView: View {
    @Environment(\.content) private var content
    @Environment(\.modelContext) private var context
    @Query(sort: \Favorite.order) private var favorites: [Favorite]

    var body: some View {
        NavigationStack {
            Group {
                if favorites.isEmpty {
                    ContentUnavailableView {
                        Label("Nog geen favorieten", systemImage: "star")
                    } description: {
                        Text("Tik op de ster bij een onderwerp of formule. Of veeg een onderwerp naar rechts.")
                    }
                } else {
                    List {
                        ForEach(favorites) { favorite in
                            row(for: favorite)
                        }
                        .onDelete(perform: delete)
                        .onMove(perform: move)
                    }
                    .listStyle(.insetGrouped)
                    .toolbar { EditButton() }
                }
            }
            .navigationTitle("Favorieten")
            .topicDestination()
        }
    }

    @ViewBuilder
    private func row(for favorite: Favorite) -> some View {
        switch favorite.kind {
        case .topic:
            if let topic = content.topic(id: favorite.itemID) {
                NavigationLink(value: TopicRoute(topicID: topic.id)) {
                    TopicRow(topic: topic)
                }
            }
        case .formula:
            if let formula = content.formula(id: favorite.itemID),
               let topicID = content.topicID(forFormula: formula.id) {
                NavigationLink(value: TopicRoute(topicID: topicID, formulaID: formula.id)) {
                    VStack(alignment: .leading, spacing: 6) {
                        if let caption = formula.caption {
                            MathText(caption, style: .footnote, weight: .semibold)
                                .foregroundStyle(.secondary)
                        }
                        // Favorites are short formulas in practice; clip rather than scroll inside a row.
                        FormulaView(latex: formula.latex, spoken: formula.spoken)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .clipped()
                    }
                    .padding(.vertical, 4)
                }
            }
        }
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets { context.delete(favorites[index]) }
    }

    private func move(from source: IndexSet, to destination: Int) {
        var reordered = favorites
        reordered.move(fromOffsets: source, toOffset: destination)
        for (index, favorite) in reordered.enumerated() { favorite.order = index }
    }
}
