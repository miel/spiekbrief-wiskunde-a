import Foundation
import SwiftUI

/// Immutable, in-memory copy of all bundled content. It is loaded once at launch; the
/// whole content is well under 300 KB, so there is no need for lazy loading.
final class ContentStore: Sendable {
    /// Content files in display order.
    static let files = ["B_algebra_tellen", "C_verbanden", "D_verandering", "E_statistiek", "examentips"]

    let domains: [Domain]
    let searchIndex: SearchIndex
    let flashcards: [Flashcard]

    private let topicsByID: [String: (topic: Topic, domain: Domain)]
    private let formulasByID: [String: (formula: Formula, topicID: String)]

    init(domains: [Domain]) {
        self.domains = domains
        var topics: [String: (topic: Topic, domain: Domain)] = [:]
        var formulas: [String: (formula: Formula, topicID: String)] = [:]
        var cards: [Flashcard] = []
        for domain in domains {
            for topic in domain.topics {
                topics[topic.id] = (topic, domain)
                for formula in topic.formulas {
                    formulas[formula.id] = (formula, topic.id)
                    if let question = formula.question {
                        cards.append(Flashcard(question: question, formula: formula, topicID: topic.id, domainID: domain.id))
                    }
                }
            }
        }
        topicsByID = topics
        formulasByID = formulas
        flashcards = cards
        searchIndex = SearchIndex(domains: domains)
    }

    /// Loads all content files from `bundle`. A malformed file is a programming error and is
    /// caught by `ContentDecodingTests`, so it crashes in debug builds.
    static func load(from bundle: Bundle = .main) -> ContentStore {
        let decoder = JSONDecoder()
        let domains: [Domain] = files.compactMap { name in
            guard let url = bundle.url(forResource: name, withExtension: "json") else {
                assertionFailure("Missing content file \(name).json")
                return nil
            }
            do {
                return try decoder.decode(Domain.self, from: Data(contentsOf: url))
            } catch {
                assertionFailure("Could not decode \(name).json: \(error)")
                return nil
            }
        }
        return ContentStore(domains: domains)
    }

    func topic(id: String) -> Topic? { topicsByID[id]?.topic }
    func domain(forTopic id: String) -> Domain? { topicsByID[id]?.domain }
    func formula(id: String) -> Formula? { formulasByID[id]?.formula }
    func topicID(forFormula id: String) -> String? { formulasByID[id]?.topicID }
}

extension EnvironmentValues {
    @Entry var content = ContentStore(domains: [])
}
