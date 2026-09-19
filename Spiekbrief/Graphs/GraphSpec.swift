import Foundation

/// A slider on an interactive graph.
struct GraphParameter: Sendable, Identifiable {
    var id: String { name }
    /// Display name, may contain inline math, e.g. "$g$".
    let name: String
    let range: ClosedRange<Double>
    let step: Double
    let initial: Double
}

/// A graph of one or more functions of x, with sliders for its parameters.
struct FunctionGraph: Sendable {
    struct Curve: Sendable {
        let name: String
        let f: @Sendable (Double, [Double]) -> Double
        /// Drawn dashed and gray, e.g. the original graph before a transformation.
        var isReference = false
    }

    let title: String
    let parameters: [GraphParameter]
    let xDomain: ClosedRange<Double>
    let yDomain: ClosedRange<Double>
    let curves: [Curve]
    /// The formula with the current parameter values filled in, as LaTeX.
    let latex: @Sendable ([Double]) -> String
    /// Horizontal line, e.g. an asymptote or the evenwichtsstand.
    var horizontalLine: (@Sendable ([Double]) -> (value: Double, label: String)?)?
    /// Vertical line, e.g. an asymptote.
    var verticalLine: (@Sendable ([Double]) -> (value: Double, label: String)?)?
    /// Points to mark, e.g. the top of a parabola.
    var points: (@Sendable ([Double]) -> [(x: Double, y: Double, label: String)])?
    /// Straight line segments, e.g. a tangent or secant: (x1, y1, x2, y2, label).
    var segments: (@Sendable ([Double]) -> [(x1: Double, y1: Double, x2: Double, y2: Double, label: String)])?
    /// One line of explanation under the graph, may contain inline math.
    var info: (@Sendable ([Double]) -> String)?
    /// Show the y-axis on a logarithmic scale.
    var logarithmicY = false
}

enum GraphDefinition: Sendable {
    case function(FunctionGraph)
    case increaseDiagram
    case recursiveSequence
    case normal
    case binomial
}

/// Number formatting for graphs: Dutch decimal comma, trailing zeros removed.
enum GraphFormat {
    static let locale = Locale(identifier: "nl_NL")

    static func number(_ value: Double, digits: Int = 2) -> String {
        guard value.isFinite else { return "–" }
        let rounded = (value * pow(10, Double(digits))).rounded() / pow(10, Double(digits))
        return rounded.formatted(.number.precision(.fractionLength(0...digits)).grouping(.never).locale(locale))
    }

    /// A term with its sign for use after another term: "+ 3", "- 2,5". Returns "" for 0.
    static func signed(_ value: Double, digits: Int = 2, suffix: String = "") -> String {
        let text = number(abs(value), digits: digits)
        if text == "0" { return "" }
        return (value < 0 ? " - " : " + ") + text + suffix
    }

    /// A coefficient in front of a variable: "" for 1, "-" for -1, else the number.
    static func coefficient(_ value: Double, digits: Int = 2) -> String {
        let text = number(value, digits: digits)
        switch text {
        case "1": return ""
        case "-1": return "-"
        default: return text
        }
    }

    static func percent(_ value: Double, digits: Int = 1) -> String {
        number(value * 100, digits: digits) + "\\pct"
    }
}
