import SwiftData
import SwiftUI

/// One practice round: question on the front, formula on the back; tap to flip.
struct FlashcardSessionView: View {
    let cards: [Flashcard]

    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var index = 0
    @State private var flipped = false
    @State private var known = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                if index < cards.count {
                    ProgressView(value: Double(index), total: Double(cards.count))
                    card(cards[index])
                    answerButtons
                } else {
                    finished
                }
            }
            .padding(16)
            .background(Color(.systemGroupedBackground))
            .navigationTitle(index < cards.count ? "Kaart \(index + 1) van \(cards.count)" : "Klaar")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Stop") { dismiss() } }
            }
        }
    }

    private func card(_ card: Flashcard) -> some View {
        ZStack {
            face {
                VStack(spacing: 12) {
                    Text("Vraag").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                    MathText(card.question, style: .title3, weight: .semibold)
                        .multilineTextAlignment(.center)
                    Text("Tik om om te draaien").font(.footnote).foregroundStyle(.secondary)
                }
            }
            .opacity(flipped ? 0 : 1)
            .accessibilityHidden(flipped)

            face {
                VStack(spacing: 12) {
                    Text("Antwoord").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                    if let caption = card.formula.caption {
                        MathText(caption, style: .subheadline).foregroundStyle(.secondary)
                    }
                    FormulaBlockView(formula: card.formula)
                    if let condition = card.formula.condition {
                        MathText("Voorwaarde: \(condition)", style: .footnote).foregroundStyle(.secondary)
                    }
                }
            }
            // Pre-rotated so the back reads correctly once the card has turned.
            .rotation3DEffect(.degrees(reduceMotion ? 0 : 180), axis: (0, 1, 0))
            .opacity(flipped ? 1 : 0)
            .accessibilityHidden(!flipped)
        }
        .rotation3DEffect(.degrees(flipped && !reduceMotion ? 180 : 0), axis: (0, 1, 0), perspective: 0.4)
        .frame(maxHeight: .infinity)
        .contentShape(.rect)
        .onTapGesture { withAnimation(.spring(duration: 0.45)) { flipped.toggle() } }
        .accessibilityElement(children: .contain)
        .accessibilityAction(named: flipped ? "Toon vraag" : "Toon antwoord") { flipped.toggle() }
        .id(card.id)
    }

    private func face<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        content()
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.secondarySystemGroupedBackground), in: .rect(cornerRadius: 20))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 4)
    }

    private var answerButtons: some View {
        HStack(spacing: 12) {
            Button {
                answer(known: false)
            } label: {
                Label("Nog niet", systemImage: "arrow.counterclockwise")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .tint(.orange)

            Button {
                answer(known: true)
            } label: {
                Label("Wist ik", systemImage: "checkmark")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(.green)
        }
        .controlSize(.large)
        .disabled(!flipped)
        .opacity(flipped ? 1 : 0.4)
        .sensoryFeedback(.success, trigger: known)
    }

    private var finished: some View {
        ContentUnavailableView {
            Label("Ronde klaar", systemImage: "checkmark.seal")
        } description: {
            Text("Je wist \(known) van de \(cards.count) kaarten.")
        } actions: {
            Button("Sluiten") { dismiss() }
                .buttonStyle(.borderedProminent)
        }
    }

    private func answer(known isKnown: Bool) {
        let card = cards[index]
        let cardID = card.id
        let descriptor = FetchDescriptor<CardProgress>(predicate: #Predicate { $0.cardID == cardID })
        let progress = (try? context.fetch(descriptor).first) ?? {
            let new = CardProgress(cardID: cardID)
            context.insert(new)
            return new
        }()
        progress.record(known: isKnown)
        if isKnown { known += 1 }
        flipped = false
        withAnimation { index += 1 }
    }
}
