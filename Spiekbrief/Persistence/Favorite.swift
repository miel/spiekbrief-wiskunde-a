import Foundation
import SwiftData

/// A starred topic or formula.
@Model
final class Favorite {
    enum Kind: String, Codable { case topic, formula }

    @Attribute(.unique) var itemID: String
    var kindRaw: String
    var createdAt: Date
    /// Position in the user's custom order on the Favorieten tab.
    var order: Int

    var kind: Kind { Kind(rawValue: kindRaw) ?? .topic }

    init(itemID: String, kind: Kind, order: Int) {
        self.itemID = itemID
        self.kindRaw = kind.rawValue
        self.createdAt = .now
        self.order = order
    }
}

extension ModelContext {
    func isFavorite(_ itemID: String) -> Bool {
        let descriptor = FetchDescriptor<Favorite>(predicate: #Predicate { $0.itemID == itemID })
        return ((try? fetchCount(descriptor)) ?? 0) > 0
    }

    func toggleFavorite(_ itemID: String, kind: Favorite.Kind) {
        let descriptor = FetchDescriptor<Favorite>(predicate: #Predicate { $0.itemID == itemID })
        if let existing = try? fetch(descriptor), !existing.isEmpty {
            for favorite in existing { delete(favorite) }
        } else {
            let count = (try? fetchCount(FetchDescriptor<Favorite>())) ?? 0
            insert(Favorite(itemID: itemID, kind: kind, order: count))
        }
    }
}
