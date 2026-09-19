import Foundation
import Testing
@testable import Spiekbrief

@Suite("Content")
struct ContentTests {
    let store = ContentStore.load()

    @Test("Alle inhoudsbestanden laden")
    func allFilesLoad() {
        #expect(store.domains.count == ContentStore.files.count)
        for domain in store.domains {
            #expect(!domain.topics.isEmpty, "\(domain.code) heeft geen onderwerpen")
        }
    }

    @Test("Ids zijn uniek en verwijzingen kloppen")
    func identifiersAreUnique() {
        var topicIDs = Set<String>()
        var formulaIDs = Set<String>()
        for domain in store.domains {
            for topic in domain.topics {
                #expect(topicIDs.insert(topic.id).inserted, "dubbele topic-id \(topic.id)")
                #expect(!topic.syllabusRef.isEmpty)
                #expect(!topic.blocks.isEmpty)
                for formula in topic.formulas {
                    #expect(formulaIDs.insert(formula.id).inserted, "dubbele formule-id \(formula.id)")
                    #expect(!formula.spoken.isEmpty, "\(formula.id) mist gesproken tekst")
                }
            }
        }
        // Every formula and topic can be looked up again, which favorites rely on.
        for id in formulaIDs {
            #expect(store.formula(id: id) != nil)
            #expect(store.topicID(forFormula: id) != nil)
        }
        for id in topicIDs {
            #expect(store.topic(id: id) != nil)
            #expect(store.domain(forTopic: id) != nil)
        }
    }

    @Test("Elke grafiek in de inhoud bestaat in GraphLibrary")
    func graphsExist() {
        for domain in store.domains {
            for topic in domain.topics {
                for block in topic.blocks {
                    if case .graph(let id) = block {
                        #expect(GraphLibrary.definition(id) != nil, "onbekende grafiek \(id) in \(topic.id)")
                    }
                }
            }
        }
    }

    @Test("GraphLibrary.allIDs klopt met definition(_:)")
    func graphLibraryIsComplete() {
        for id in GraphLibrary.allIDs {
            #expect(GraphLibrary.definition(id) != nil, "\(id) ontbreekt in definition(_:)")
        }
        #expect(GraphLibrary.definition("bestaat-niet") == nil)
    }

    @Test("Domein E is gemarkeerd als schoolexamen")
    func schoolExamMarking() throws {
        let e = try #require(store.domains.first { $0.code == "E" })
        #expect(e.schoolExamOnly)
        for topic in e.topics {
            let badges = Set(topic.formulas.map(\.badge))
            #expect(badges.isEmpty || badges == [.se], "\(topic.id) heeft niet-SE formules")
        }
    }

    @Test("De formulelijst komt overeen met bijlage 5")
    func formulaSheetIsComplete() throws {
        let sheet = store.domains.flatMap(\.topics).flatMap(\.formulas).filter { $0.badge == .formulelijst }
        // 5 differentiation rules + 4 log rules, both in the tips topic and in the domain topics.
        let onTipsPage = try #require(store.topic(id: "tips-formulelijst")).formulas
        #expect(onTipsPage.count == 9)
        #expect(sheet.count >= 9)
    }

    @Test("Flashcards komen alleen van formules die je paraat moet kennen")
    func flashcardsAreParaat() {
        #expect(!store.flashcards.isEmpty)
        for card in store.flashcards {
            #expect(card.formula.badge != .formulelijst, "\(card.id) staat op de formulelijst en hoeft niet geleerd te worden")
            #expect(!card.question.isEmpty)
            #expect(store.topic(id: card.topicID) != nil)
        }
    }
}
