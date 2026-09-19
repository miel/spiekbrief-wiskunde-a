import SwiftUI

/// Navigation value for opening a topic, optionally scrolled to one formula.
struct TopicRoute: Hashable {
    let topicID: String
    var formulaID: String?
}

enum AppTab: Hashable {
    case browse, search, favorites, practice
}

struct RootTabView: View {
    @State private var selection: AppTab = .browse

    var body: some View {
        TabView(selection: $selection) {
            Tab("Spiekbrief", systemImage: "list.bullet.rectangle", value: .browse) {
                BrowseView()
            }
            Tab("Zoeken", systemImage: "magnifyingglass", value: .search, role: .search) {
                SearchView()
            }
            Tab("Favorieten", systemImage: "star", value: .favorites) {
                FavoritesView()
            }
            Tab("Oefenen", systemImage: "rectangle.on.rectangle.angled", value: .practice) {
                FlashcardsHomeView()
            }
        }
    }
}

extension View {
    /// Registers the topic destination; every tab's `NavigationStack` uses it.
    func topicDestination() -> some View {
        navigationDestination(for: TopicRoute.self) { route in
            TopicView(topicID: route.topicID, scrollTo: route.formulaID)
        }
    }
}
