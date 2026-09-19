import Foundation

/// In-memory search over topics and formulas. The content has a few hundred items, so a
/// linear scan over pre-normalized strings is fast enough (well under 1 ms on an A14).
struct SearchIndex: Sendable {
    struct Entry: Sendable, Hashable, Identifiable {
        enum Kind: Sendable, Hashable { case topic, formula }
        let kind: Kind
        let id: String
        let topicID: String
        let domainID: String
        let title: String
        let subtitle: String
        /// Normalized text that queries are matched against.
        fileprivate let haystack: String
        /// Normalized title, so title hits rank first.
        fileprivate let normalizedTitle: String
    }

    /// Dutch synonyms and common abbreviations, keyed by normalized term.
    static let synonyms: [String: [String]] = [
        "afgeleide": ["differentieren", "hellingfunctie"],
        "differentieren": ["afgeleide"],
        "rc": ["richtingscoefficient", "helling"],
        "richtingscoefficient": ["rc", "helling"],
        "log": ["logaritme"],
        "logaritme": ["log", "ln"],
        "ln": ["natuurlijke logaritme"],
        "exponentieel": ["groeifactor", "groei"],
        "groei": ["exponentieel", "groeifactor"],
        "kans": ["kansrekenen", "verdeling"],
        "binomiaal": ["binomiale verdeling"],
        "normaal": ["normale verdeling"],
        "som": ["somrij", "sigma"],
        "sigma": ["som", "somrij", "standaardafwijking"],
        "gr": ["numworks", "rekenmachine"],
        "rekenmachine": ["numworks"],
        "top": ["maximum", "minimum", "extreme waarde"],
        "max": ["maximum"],
        "min": ["minimum"],
        "sinus": ["sin", "periode", "amplitude"],
        "procent": ["percentage", "groeipercentage"],
        "faculteit": ["permutaties"],
        "combinatie": ["combinaties", "n boven k"],
        "betrouwbaarheidsinterval": ["bi"],
        "bi": ["betrouwbaarheidsinterval"],
    ]

    let entries: [Entry]

    init(domains: [Domain]) {
        var entries: [Entry] = []
        for domain in domains {
            for topic in domain.topics {
                let topicText = [topic.title, topic.summary, topic.keywords.joined(separator: " "), domain.title]
                    .joined(separator: " ")
                entries.append(Entry(
                    kind: .topic, id: topic.id, topicID: topic.id, domainID: domain.id,
                    title: topic.title, subtitle: "\(domain.code) · \(domain.title)",
                    haystack: Self.normalize(topicText), normalizedTitle: Self.normalize(topic.title)))
                for formula in topic.formulas {
                    let title = formula.caption ?? formula.question ?? topic.title
                    let text = [title, formula.spoken, formula.question ?? "", topic.title, topic.keywords.joined(separator: " ")]
                        .joined(separator: " ")
                    entries.append(Entry(
                        kind: .formula, id: formula.id, topicID: topic.id, domainID: domain.id,
                        title: title, subtitle: topic.title,
                        haystack: Self.normalize(text), normalizedTitle: Self.normalize(title)))
                }
            }
        }
        self.entries = entries
    }

    /// Lowercases and removes diacritics, so "differentieren" matches "differentiëren".
    static func normalize(_ text: String) -> String {
        text.folding(options: [.caseInsensitive, .diacriticInsensitive, .widthInsensitive], locale: Locale(identifier: "nl_NL"))
    }

    /// Returns entries where every query word (or one of its synonyms) occurs. Title matches rank first.
    func search(_ query: String, limit: Int = 60) -> [Entry] {
        let words = Self.normalize(query)
            .split(whereSeparator: { $0.isWhitespace || $0 == "," })
            .map(String.init)
        guard !words.isEmpty else { return [] }
        let alternatives = words.map { [$0] + (Self.synonyms[$0] ?? []) }

        var scored: [(Entry, Int)] = []
        for entry in entries {
            guard alternatives.allSatisfy({ alts in alts.contains { entry.haystack.contains($0) } }) else { continue }
            var score = 0
            for word in words where entry.normalizedTitle.contains(word) { score += 10 }
            if entry.normalizedTitle.hasPrefix(words[0]) { score += 5 }
            if entry.kind == .topic { score += 2 }
            scored.append((entry, score))
        }
        return scored
            .sorted { $0.1 != $1.1 ? $0.1 > $1.1 : $0.0.title < $1.0.title }
            .prefix(limit)
            .map { $0.0 }
    }
}
