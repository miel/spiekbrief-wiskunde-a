import XCTest

/// Formulas are typeset into images off the main actor and cached, and `TopicView` prewarms a
/// whole topic when it appears. That ordering only happens once a topic is pushed onto a
/// navigation stack, which the unit tests cannot reach — so it is checked here.
final class FormulaRenderingUITests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    /// The bug this guards: `FormulaView`'s task used to return early when `prewarm` had already
    /// cached the key, without publishing to `@State`. `body` reads the cache directly, but that
    /// read is not a SwiftUI dependency, so every row on the screen kept its placeholder for good.
    func testNoFormulaStaysOnItsPlaceholderAfterPushingATopic() {
        let app = XCUIApplication()
        app.launch()

        let topic = app.staticTexts["Machten en wortels"].firstMatch
        XCTAssertTrue(topic.waitForExistence(timeout: 30), "Onderwerp niet gevonden in de lijst")
        topic.tap()

        let rendered = app.descendants(matching: .any)
            .matching(identifier: FormulaViewIdentifiers.rendered)
        let placeholders = app.descendants(matching: .any)
            .matching(identifier: FormulaViewIdentifiers.placeholder)

        XCTAssertTrue(
            rendered.firstMatch.waitForExistence(timeout: 20),
            "Geen enkele formule is getypeset na het openen van het onderwerp"
        )

        // Typesetting is asynchronous, so give the last rows a moment before judging them.
        let settled = expectation(description: "alle zichtbare formules zijn getypeset")
        let deadline = Date().addingTimeInterval(20)
        let poll = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { timer in
            if placeholders.count == 0 || Date() > deadline {
                timer.invalidate()
                settled.fulfill()
            }
        }
        RunLoop.current.add(poll, forMode: .common)
        wait(for: [settled], timeout: 25)

        XCTAssertEqual(
            placeholders.count, 0,
            "\(placeholders.count) formule(s) bleven op de placeholder staan; \(rendered.count) getypeset"
        )
    }
}

/// Mirrors `FormulaView.placeholderID` / `.renderedID`; UI tests cannot import the app target.
enum FormulaViewIdentifiers {
    static let placeholder = "formula-placeholder"
    static let rendered = "formula-rendered"
}
