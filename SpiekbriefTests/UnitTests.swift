import Foundation
import Testing
@testable import Spiekbrief

@Suite("LaTeX-preprocessor")
struct LatexPreprocessorTests {
    @Test("g-log wordt een linker superscript")
    func glog() {
        #expect(LatexPreprocessor.process(#"\glog{g}(a)"#) == #"{}^{g}\!\log(a)"#)
        #expect(LatexPreprocessor.process(#"\glog{1,5}(2)"#) == #"{}^{1,\!5}\!\log(2)"#)
    }

    @Test("Decimale komma krijgt een negatieve spatie, andere komma's niet")
    func decimalComma() {
        #expect(LatexPreprocessor.decimalCommas("0,5") == #"0,\!5"#)
        #expect(LatexPreprocessor.decimalCommas("(2, 3)") == "(2, 3)")
        #expect(LatexPreprocessor.decimalCommas(#"\binom{n}{k}"#) == #"\binom{n}{k}"#)
        #expect(LatexPreprocessor.decimalCommas("f(x, y)") == "f(x, y)")
    }

    @Test("Procent wordt geëscaped")
    func percent() {
        #expect(LatexPreprocessor.process(#"12\pct"#) == #"12\%"#)
    }

    @Test("Geneste accolades in een macro-argument")
    func nestedBraces() {
        #expect(LatexPreprocessor.process(#"\glog{\frac{a}{b}}(x)"#) == #"{}^{\frac{a}{b}}\!\log(x)"#)
    }

    @Test("Ongebalanceerde accolades laten de tekst intact")
    func unbalanced() {
        let input = #"\glog{g(a)"#
        #expect(LatexPreprocessor.process(input) == input)
    }
}

@Suite("Voorlezen")
struct LatexSpeechTests {
    @Test("Breuken en machten worden woorden")
    func fractions() {
        let spoken = LatexSpeech.approximate(#"\frac{a}{b}"#)
        #expect(spoken.contains("gedeeld door"))
        #expect(LatexSpeech.approximate("x^2").contains("kwadraat"))
        #expect(!LatexSpeech.approximate(#"\glog{g}(a)"#).contains("min"))
    }

    @Test("Er blijven geen backslashes of accolades over")
    func noLeftovers() {
        let spoken = LatexSpeech.approximate(#"\sqrt{x} \cdot \frac{1}{2} \leq \sigma"#)
        #expect(!spoken.contains("\\"))
        #expect(!spoken.contains("{"))
    }
}

@Suite("Zoeken")
struct SearchIndexTests {
    let store = ContentStore.load()

    @Test("Accenten en hoofdletters maken niet uit")
    func diacritics() {
        let withAccent = store.searchIndex.search("differentiëren")
        let without = store.searchIndex.search("DIFFERENTIEREN")
        #expect(!withAccent.isEmpty)
        #expect(withAccent.map(\.id) == without.map(\.id))
    }

    @Test("Synoniemen vinden hetzelfde onderwerp")
    func synonyms() {
        #expect(!store.searchIndex.search("rc").isEmpty)
        #expect(!store.searchIndex.search("gr").isEmpty)
    }

    @Test("Bekende zoektermen geven resultaten")
    func knownTerms() {
        for term in ["halveringstijd", "kettingregel", "combinaties", "somrij", "normale verdeling", "raaklijn", "groeifactor"] {
            #expect(!store.searchIndex.search(term).isEmpty, "geen resultaat voor \(term)")
        }
    }

    @Test("Onzin geeft niets, lege invoer ook niet")
    func noResults() {
        #expect(store.searchIndex.search("qqzzxx").isEmpty)
        #expect(store.searchIndex.search("   ").isEmpty)
    }

    @Test("Alle zoekwoorden moeten voorkomen")
    func allWordsMustMatch() {
        let results = store.searchIndex.search("afgeleide logaritme")
        for entry in results {
            #expect(entry.topicID.isEmpty == false)
        }
        #expect(store.searchIndex.search("afgeleide qqzzxx").isEmpty)
    }
}

@Suite("Oefenkaarten")
struct CardProgressTests {
    @Test("Goed beantwoorden schuift een bak op, fout terug naar bak 1")
    func leitner() {
        let card = CardProgress(cardID: "test")
        #expect(card.box == 1)
        card.record(known: true)
        #expect(card.box == 2)
        card.record(known: true)
        #expect(card.box == 3)
        card.record(known: false)
        #expect(card.box == 1)
        #expect(card.timesKnown == 2)
        #expect(card.timesMissed == 1)
    }

    @Test("Een kaart in bak 1 is meteen weer aan de beurt")
    func dueDates() {
        let card = CardProgress(cardID: "test")
        card.record(known: false)
        #expect(card.isDue())
        card.record(known: true)   // bak 2: morgen
        #expect(!card.isDue())
        #expect(card.isDue(now: .now.addingTimeInterval(2 * 24 * 3600)))
    }

    @Test("De bak loopt niet verder dan het maximum")
    func maximumBox() {
        let card = CardProgress(cardID: "test")
        for _ in 0..<10 { card.record(known: true) }
        #expect(card.box == CardProgress.maxBox)
    }
}

@Suite("Grafieken")
struct GraphLibraryTests {
    @Test("Functies rekenen goed")
    func functionValues() throws {
        guard case .function(let linear) = try #require(GraphLibrary.definition("lineair")) else {
            Issue.record("lineair is geen functiegrafiek"); return
        }
        // y = 2x + 1 bij de standaardwaarden
        let p = linear.parameters.map(\.initial)
        #expect(linear.curves[0].f(3, p) == 7)
        #expect(linear.latex(p).contains("2"))
    }

    @Test("Ongeldige punten worden NaN, niet oneindig")
    func undefinedPoints() throws {
        guard case .function(let log) = try #require(GraphLibrary.definition("logaritme")) else { return }
        let p = log.parameters.map(\.initial)
        #expect(log.curves[0].f(-1, p).isNaN)
        #expect(log.curves[0].f(8, p).isFinite)
    }

    @Test("Halveringstijd in de uitleg klopt")
    func exponentialInfo() throws {
        guard case .function(let exponential) = try #require(GraphLibrary.definition("exponentieel")) else { return }
        let info = try #require(exponential.info)
        #expect(info([2, 0.5]).contains("Halveringstijd"))
        #expect(info([2, 2]).contains("Verdubbelingstijd"))
    }

    @Test("Normale en binomiale kansen kloppen")
    func distributions() {
        // 68-95-99,7: binnen één standaardafwijking ligt ongeveer 68 %.
        let oneSigma = NormalDistributionView.cdf(1, mu: 0, sigma: 1) - NormalDistributionView.cdf(-1, mu: 0, sigma: 1)
        #expect(abs(oneSigma - 0.6827) < 0.001)
        let twoSigma = NormalDistributionView.cdf(2, mu: 0, sigma: 1) - NormalDistributionView.cdf(-2, mu: 0, sigma: 1)
        #expect(abs(twoSigma - 0.9545) < 0.001)

        // P(X = 2) bij n = 5, p = 0,5 is 10/32.
        #expect(abs(BinomialDistributionView.pmf(2, n: 5, p: 0.5) - 10.0 / 32.0) < 1e-12)
        let total = (0...20).map { BinomialDistributionView.pmf($0, n: 20, p: 0.3) }.reduce(0, +)
        #expect(abs(total - 1) < 1e-9)
    }

    @Test("Getallen krijgen een Nederlandse komma")
    func numberFormatting() {
        #expect(GraphFormat.number(1.5) == "1,5")
        #expect(GraphFormat.number(2) == "2")
        #expect(GraphFormat.number(1234.567, digits: 1) == "1234,6")
        #expect(GraphFormat.signed(-2.5) == " - 2,5")
        #expect(GraphFormat.signed(0) == "")
        #expect(GraphFormat.coefficient(1) == "")
        #expect(GraphFormat.coefficient(-1) == "-")
    }
}
