import SwiftData
import SwiftUI

/// Toolbar/inline star button for one item. Uses a filtered query so it updates live.
struct FavoriteButton: View {
    let itemID: String
    let kind: Favorite.Kind

    @Environment(\.modelContext) private var context
    @Query private var matches: [Favorite]

    init(itemID: String, kind: Favorite.Kind) {
        self.itemID = itemID
        self.kind = kind
        _matches = Query(filter: #Predicate<Favorite> { $0.itemID == itemID })
    }

    private var isFavorite: Bool { !matches.isEmpty }

    var body: some View {
        Button {
            withAnimation { context.toggleFavorite(itemID, kind: kind) }
        } label: {
            Label(isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten",
                  systemImage: isFavorite ? "star.fill" : "star")
        }
        .tint(isFavorite ? .yellow : nil)
        .sensoryFeedback(.selection, trigger: isFavorite)
    }
}

private struct FavoriteSwipeAction: ViewModifier {
    let itemID: String
    let kind: Favorite.Kind
    let isFavorite: Bool
    @Environment(\.modelContext) private var context

    func body(content: Content) -> some View {
        content.swipeActions(edge: .leading) {
            Button {
                withAnimation { context.toggleFavorite(itemID, kind: kind) }
            } label: {
                Label(isFavorite ? "Verwijder ster" : "Ster", systemImage: isFavorite ? "star.slash" : "star")
            }
            .tint(.yellow)
        }
    }
}

extension View {
    /// Swipe right on a list row to (un)star it. Pass `isFavorite` from a single `@Query` in the
    /// list, instead of one query per row.
    func favoriteSwipeAction(itemID: String, kind: Favorite.Kind, isFavorite: Bool) -> some View {
        modifier(FavoriteSwipeAction(itemID: itemID, kind: kind, isFavorite: isFavorite))
    }
}
