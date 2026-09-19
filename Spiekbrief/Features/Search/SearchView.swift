import SwiftUI

struct SearchView: View {
    @Environment(\.content) private var content
    @State private var query = ""

    private static let suggestions = ["afgeleide", "halveringstijd", "logaritme", "kettingregel", "combinaties", "somrij", "normale verdeling", "raaklijn"]

    var body: some View {
        NavigationStack {
            List {
                if query.trimmingCharacters(in: .whitespaces).isEmpty {
                    Section("Probeer") {
                        ForEach(Self.suggestions, id: \.self) { suggestion in
                            Button {
                                query = suggestion
                            } label: {
                                Label(suggestion, systemImage: "magnifyingglass")
                            }
                        }
                    }
                } else {
                    let results = content.searchIndex.search(query)
                    if results.isEmpty {
                        ContentUnavailableView.search(text: query)
                    } else {
                        ForEach(groupedByDomain(results)) { group in
                            Section {
                                ForEach(group.entries) { entry in
                                    NavigationLink(value: TopicRoute(
                                        topicID: entry.topicID,
                                        formulaID: entry.kind == .formula ? entry.id : nil)
                                    ) {
                                        SearchResultRow(entry: entry)
                                    }
                                }
                            } header: {
                                DomainHeader(domain: group.domain)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Zoeken")
            .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Formule, begrip of onderwerp")
            .autocorrectionDisabled()
            .textInputAutocapitalization(.never)
            .topicDestination()
        }
    }

    private func groupedByDomain(_ entries: [SearchIndex.Entry]) -> [DomainGroup] {
        content.domains.compactMap { domain in
            let matches = entries.filter { $0.domainID == domain.id }
            return matches.isEmpty ? nil : DomainGroup(domain: domain, entries: matches)
        }
    }
}

private struct DomainGroup: Identifiable {
    let domain: Domain
    let entries: [SearchIndex.Entry]
    var id: String { domain.id }
}

private struct SearchResultRow: View {
    let entry: SearchIndex.Entry

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: entry.kind == .formula ? "function" : "doc.text")
                .foregroundStyle(.secondary)
                .frame(width: 20)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                MathText(entry.title)
                Text(entry.subtitle)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityHint(entry.kind == .formula ? "Formule" : "Onderwerp")
    }
}
