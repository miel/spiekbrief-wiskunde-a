import Foundation

/// A domain from the examenprogramma (B, C, D, E) or the extra "Examentips" section.
struct Domain: Codable, Identifiable, Hashable, Sendable {
    let id: String
    let code: String
    let title: String
    let symbol: String
    /// Name of a system color, see `Domain.tint`.
    let color: String
    /// True for school-exam-only content (domain E).
    var schoolExamOnly: Bool = false
    let topics: [Topic]

    enum CodingKeys: String, CodingKey { case id, code, title, symbol, color, schoolExamOnly, topics }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        code = try c.decode(String.self, forKey: .code)
        title = try c.decode(String.self, forKey: .title)
        symbol = try c.decode(String.self, forKey: .symbol)
        color = try c.decode(String.self, forKey: .color)
        schoolExamOnly = try c.decodeIfPresent(Bool.self, forKey: .schoolExamOnly) ?? false
        topics = try c.decode([Topic].self, forKey: .topics)
    }
}

struct Topic: Codable, Identifiable, Hashable, Sendable {
    let id: String
    let title: String
    let summary: String
    /// Reference to the syllabus section, e.g. "C2.3" (subdomein + vaardigheid).
    let syllabusRef: String
    var keywords: [String] = []
    let blocks: [Block]

    enum CodingKeys: String, CodingKey { case id, title, summary, syllabusRef, keywords, blocks }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        title = try c.decode(String.self, forKey: .title)
        summary = try c.decode(String.self, forKey: .summary)
        syllabusRef = try c.decode(String.self, forKey: .syllabusRef)
        keywords = try c.decodeIfPresent([String].self, forKey: .keywords) ?? []
        blocks = try c.decode([Block].self, forKey: .blocks)
    }

    /// All formulas of this topic, with their stable ids.
    var formulas: [Formula] {
        blocks.compactMap { if case .formula(let f) = $0 { f } else { nil } }
    }
}

/// How the student should treat a formula at the exam.
enum Badge: String, Codable, Sendable, CaseIterable {
    /// Printed on the formulelijst (syllabus bijlage 5).
    case formulelijst
    /// Must be known by heart.
    case paraat
    /// Only in the schoolexamen (domain E).
    case se
    /// Handy, but not required by the syllabus.
    case extra

    var label: String {
        switch self {
        case .formulelijst: "Op formulelijst"
        case .paraat: "Paraat kennen"
        case .se: "SE"
        case .extra: "Handig, niet vereist"
        }
    }

    var symbol: String {
        switch self {
        case .formulelijst: "doc.text"
        case .paraat: "brain.head.profile"
        case .se: "building.columns"
        case .extra: "lightbulb"
        }
    }
}

struct Formula: Codable, Hashable, Sendable, Identifiable {
    let id: String
    let latex: String
    /// Dutch text read by VoiceOver.
    let spoken: String
    let badge: Badge
    var caption: String?
    /// Condition shown under the formula, e.g. "g > 0, g ≠ 1".
    var condition: String?
    /// Flashcard question; formulas with a question become flashcards.
    var question: String?
}

struct ExampleStep: Codable, Hashable, Sendable {
    let text: String
    var latex: String?
}

struct Example: Codable, Hashable, Sendable {
    let title: String
    /// The question, shown before the steps are revealed.
    let problem: String
    let steps: [ExampleStep]
}

struct NumWorksTip: Codable, Hashable, Sendable {
    /// App name as shown on the calculator, e.g. "Functies", "Kansrekenen".
    let app: String
    let steps: [String]
    var note: String?
}

struct TableData: Codable, Hashable, Sendable {
    var caption: String?
    let headers: [String]
    let rows: [[String]]
}

enum Block: Hashable, Sendable {
    case text(String)
    case heading(String)
    case formula(Formula)
    case example(Example)
    case numworks(NumWorksTip)
    case graph(id: String)
    case table(TableData)
    case tip(String)
    case warning(String)
}

extension Block: Codable {
    private enum CodingKeys: String, CodingKey { case type, text, graph }
    private enum Kind: String, Codable {
        case text, heading, formula, example, numworks, graph, table, tip, warning
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        switch try c.decode(Kind.self, forKey: .type) {
        case .text: self = .text(try c.decode(String.self, forKey: .text))
        case .heading: self = .heading(try c.decode(String.self, forKey: .text))
        case .tip: self = .tip(try c.decode(String.self, forKey: .text))
        case .warning: self = .warning(try c.decode(String.self, forKey: .text))
        case .graph: self = .graph(id: try c.decode(String.self, forKey: .graph))
        case .formula: self = .formula(try Formula(from: decoder))
        case .example: self = .example(try Example(from: decoder))
        case .numworks: self = .numworks(try NumWorksTip(from: decoder))
        case .table: self = .table(try TableData(from: decoder))
        }
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .text(let s): try c.encode(Kind.text, forKey: .type); try c.encode(s, forKey: .text)
        case .heading(let s): try c.encode(Kind.heading, forKey: .type); try c.encode(s, forKey: .text)
        case .tip(let s): try c.encode(Kind.tip, forKey: .type); try c.encode(s, forKey: .text)
        case .warning(let s): try c.encode(Kind.warning, forKey: .type); try c.encode(s, forKey: .text)
        case .graph(let id): try c.encode(Kind.graph, forKey: .type); try c.encode(id, forKey: .graph)
        case .formula(let f): try c.encode(Kind.formula, forKey: .type); try f.encode(to: encoder)
        case .example(let e): try c.encode(Kind.example, forKey: .type); try e.encode(to: encoder)
        case .numworks(let n): try c.encode(Kind.numworks, forKey: .type); try n.encode(to: encoder)
        case .table(let t): try c.encode(Kind.table, forKey: .type); try t.encode(to: encoder)
        }
    }
}

/// A flashcard, derived from a formula that has a `question`.
struct Flashcard: Identifiable, Hashable, Sendable {
    var id: String { formula.id }
    let question: String
    let formula: Formula
    let topicID: String
    let domainID: String
}
