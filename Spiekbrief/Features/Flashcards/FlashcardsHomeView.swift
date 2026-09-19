import SwiftData
import SwiftUI

/// Practice the formulas that are *not* on the formula sheet ("Paraat kennen").
struct FlashcardsHomeView: View {
    @Environment(\.content) private var content
    @Query private var progress: [CardProgress]
    @State private var domainFilter: String?
    @State private var session: FlashcardSession?

    private var cards: [Flashcard] {
        content.flashcards.filter { domainFilter == nil || $0.domainID == domainFilter }
    }

    private var progressByID: [String: CardProgress] {
        Dictionary(progress.map { ($0.cardID, $0) }, uniquingKeysWith: { first, _ in first })
    }

    private func dueCards() -> [Flashcard] {
        let byID = progressByID
        let now = Date.now
        return cards.filter { byID[$0.id]?.isDue(now: now) ?? true }
    }

    var body: some View {
        let byID = progressByID
        let due = dueCards()
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("\(due.count) van \(cards.count) kaarten te oefenen")
                            .font(.headline)
                        BoxProgressView(cards: cards, progress: byID)
                        Button {
                            session = FlashcardSession(cards: due.shuffled())
                        } label: {
                            Label("Start oefenen", systemImage: "play.fill")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .disabled(due.isEmpty)
                        if due.isEmpty && !cards.isEmpty {
                            Button("Toch alles oefenen") { session = FlashcardSession(cards: cards.shuffled()) }
                                .frame(maxWidth: .infinity)
                                // Borderless, so tapping elsewhere in the list row does not trigger it.
                                .buttonStyle(.borderless)
                        }
                    }
                    .padding(.vertical, 6)
                } footer: {
                    Text("Kaarten die je weet, komen pas na 1, 3, 7 of 14 dagen terug. Wat op de formulelijst staat, hoef je niet te leren.")
                }

                Section("Onderwerp") {
                    Picker("Domein", selection: $domainFilter) {
                        Text("Alles").tag(String?.none)
                        ForEach(content.domains.filter { domain in content.flashcards.contains { $0.domainID == domain.id } }) { domain in
                            Text("\(domain.code) \(domain.title)").tag(Optional(domain.id))
                        }
                    }
                    .pickerStyle(.inline)
                    .labelsHidden()
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Oefenen")
            .fullScreenCover(item: $session) { session in
                FlashcardSessionView(cards: session.cards)
            }
        }
    }
}

private struct FlashcardSession: Identifiable {
    let id = UUID()
    let cards: [Flashcard]
}

/// Five small bars showing how many cards sit in each Leitner box.
private struct BoxProgressView: View {
    let cards: [Flashcard]
    let progress: [String: CardProgress]

    var body: some View {
        let counts = (1...CardProgress.maxBox).map { box in
            cards.filter { (progress[$0.id]?.box ?? 1) == box }.count
        }
        let total = max(cards.count, 1)
        HStack(alignment: .bottom, spacing: 6) {
            ForEach(counts.indices, id: \.self) { index in
                let count = counts[index]
                VStack(spacing: 4) {
                    Capsule()
                        .fill(Color.accentColor.opacity(0.3 + 0.15 * Double(index)))
                        .frame(height: max(4, 40 * CGFloat(count) / CGFloat(total)))
                    Text("\(count)").font(.caption2.monospacedDigit()).foregroundStyle(.secondary)
                }
            }
        }
        .frame(height: 60, alignment: .bottom)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Voortgang per bak: " + counts.indices.map { "bak \($0 + 1): \(counts[$0])" }.joined(separator: ", "))
    }
}
