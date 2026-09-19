import SwiftData
import SwiftUI

/// Home tab: all domains as sections, each with its topics.
struct BrowseView: View {
    @Environment(\.content) private var content
    @Query private var favorites: [Favorite]
    @State private var showAbout = false

    var body: some View {
        let favoriteIDs = Set(favorites.map(\.itemID))
        NavigationStack {
            List {
                ForEach(content.domains) { domain in
                    Section {
                        ForEach(domain.topics) { topic in
                            NavigationLink(value: TopicRoute(topicID: topic.id)) {
                                TopicRow(topic: topic)
                            }
                            .favoriteSwipeAction(itemID: topic.id, kind: .topic, isFavorite: favoriteIDs.contains(topic.id))
                        }
                    } header: {
                        DomainHeader(domain: domain)
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Wiskunde A")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Over deze app", systemImage: "info.circle") { showAbout = true }
                }
            }
            .sheet(isPresented: $showAbout) { AboutView() }
            .topicDestination()
        }
    }
}

struct DomainHeader: View {
    let domain: Domain

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: domain.symbol)
                .foregroundStyle(domain.tint)
                .accessibilityHidden(true)
            Text("\(domain.code)  \(domain.title)")
            if domain.schoolExamOnly {
                BadgeLabel(badge: .se, compact: true)
            }
        }
        .font(.subheadline.weight(.semibold))
        .textCase(nil)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}

struct TopicRow: View {
    let topic: Topic

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(topic.title)
                .font(.body)
            Text(topic.summary)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 2)
    }
}

extension Domain {
    var tint: Color {
        switch color {
        case "blue": .blue
        case "green": .green
        case "orange": .orange
        case "purple": .purple
        case "teal": .teal
        case "pink": .pink
        case "indigo": .indigo
        default: .accentColor
        }
    }
}
