import Foundation
import SwiftData

/// Leitner-box progress of one flashcard. Box 1 is asked every session; a card that is
/// known moves up a box and waits longer before it is asked again.
@Model
final class CardProgress {
    @Attribute(.unique) var cardID: String
    var box: Int
    var due: Date
    var timesKnown: Int
    var timesMissed: Int

    init(cardID: String) {
        self.cardID = cardID
        self.box = 1
        self.due = .distantPast
        self.timesKnown = 0
        self.timesMissed = 0
    }

    static let maxBox = 5

    /// Days to wait before a card in `box` is due again.
    static func interval(forBox box: Int) -> Int {
        switch box {
        case ...1: 0
        case 2: 1
        case 3: 3
        case 4: 7
        default: 14
        }
    }

    func record(known: Bool, now: Date = .now, calendar: Calendar = .current) {
        if known {
            timesKnown += 1
            box = min(box + 1, Self.maxBox)
        } else {
            timesMissed += 1
            box = 1
        }
        let start = calendar.startOfDay(for: now)
        due = calendar.date(byAdding: .day, value: Self.interval(forBox: box), to: start) ?? now
    }

    func isDue(now: Date = .now) -> Bool { due <= now }
}
