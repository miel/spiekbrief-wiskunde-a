import Foundation

/// All interactive graphs, by the id used in the content JSON (`{"type": "graph", "graph": "sinus"}`).
///
/// Functions are Swift closures rather than parsed expressions: no parser to get wrong, and
/// evaluation is fast enough to resample every curve on each slider tick.
enum GraphLibrary {
    static func definition(_ id: String) -> GraphDefinition? {
        switch id {
        case "lineair": .function(linear)
        case "kwadratisch": .function(quadratic)
        case "macht": .function(power)
        case "exponentieel": .function(exponential)
        case "logaritme": .function(logarithm)
        case "sinus": .function(sine)
        case "transformaties": .function(transformations)
        case "omgekeerd-evenredig": .function(inverseProportional)
        case "raaklijn": .function(tangent)
        case "hellinggrafiek": .function(slopeGraph)
        case "logschaal": .function(logScale)
        case "toenamediagram": .increaseDiagram
        case "rij-recursief": .recursiveSequence
        case "normaal": .normal
        case "binomiaal": .binomial
        default: nil
        }
    }

    static let allIDs = [
        "lineair", "kwadratisch", "macht", "exponentieel", "logaritme", "sinus", "transformaties",
        "omgekeerd-evenredig", "raaklijn", "hellinggrafiek", "logschaal", "toenamediagram",
        "rij-recursief", "normaal", "binomiaal",
    ]

    private typealias F = GraphFormat

    static let linear = FunctionGraph(
        title: "Lineaire functie",
        parameters: [
            GraphParameter(name: "$a$ (rc)", range: -4...4, step: 0.5, initial: 2),
            GraphParameter(name: "$b$", range: -5...5, step: 0.5, initial: 1),
        ],
        xDomain: -5...5, yDomain: -10...10,
        curves: [.init(name: "f") { x, p in p[0] * x + p[1] }],
        latex: { p in "y = \(F.coefficient(p[0]))x\(F.signed(p[1]))" },
        points: { p in [(0, p[1], "(0, b)")] },
        info: { p in "Elke stap $+1$ naar rechts gaat de grafiek $\(F.number(p[0]))$ omhoog." }
    )

    static let quadratic = FunctionGraph(
        title: "Tweedegraadsfunctie",
        parameters: [
            GraphParameter(name: "$a$", range: -3...3, step: 0.25, initial: 1),
            GraphParameter(name: "$b$", range: -6...6, step: 0.5, initial: -2),
            GraphParameter(name: "$c$", range: -6...6, step: 0.5, initial: -3),
        ],
        xDomain: -6...6, yDomain: -10...10,
        curves: [.init(name: "f") { x, p in p[0] * x * x + p[1] * x + p[2] }],
        latex: { p in
            let a = p[0] == 0 ? "" : "\(F.coefficient(p[0]))x^2"
            return "y = \(a)\(F.signed(p[1], suffix: "x"))\(F.signed(p[2]))"
        },
        points: { p in
            guard p[0] != 0 else { return [] }
            let xt = -p[1] / (2 * p[0])
            return [(xt, p[0] * xt * xt + p[1] * xt + p[2], "top")]
        },
        info: { p in
            if p[0] > 0 { return "$a > 0$: dalparabool, de top is een minimum." }
            if p[0] < 0 { return "$a < 0$: bergparabool, de top is een maximum." }
            return "$a = 0$: geen parabool meer, maar een rechte lijn."
        }
    )

    static let power = FunctionGraph(
        title: "Machtsfunctie",
        parameters: [
            GraphParameter(name: "$a$", range: -3...3, step: 0.5, initial: 1),
            GraphParameter(name: "$n$", range: -2...3, step: 0.5, initial: 0.5),
        ],
        xDomain: 0...6, yDomain: -6...6,
        curves: [.init(name: "f") { x, p in x <= 0 && p[1] <= 0 ? .nan : p[0] * pow(x, p[1]) }],
        latex: { p in "y = \(F.coefficient(p[0]))x^{\(F.number(p[1]))}" },
        info: { p in
            let n = p[1]
            if n > 1 { return "$n > 1$: toenemend stijgend (bij $a > 0$)." }
            if n == 1 { return "$n = 1$: een rechte lijn." }
            if n > 0 { return "$0 < n < 1$: afnemend stijgend (bij $a > 0$), zoals $\\sqrt{x} = x^{0,5}$." }
            if n == 0 { return "$n = 0$: constant, $y = a$." }
            return "$n < 0$: de $x$-as en $y$-as zijn asymptoten, bijv. $x^{-1} = \\frac{1}{x}$."
        }
    )

    static let exponential = FunctionGraph(
        title: "Exponentiële functie",
        parameters: [
            GraphParameter(name: "beginwaarde $b$", range: 0.5...8, step: 0.5, initial: 2),
            GraphParameter(name: "groeifactor $g$", range: 0.2...2.5, step: 0.05, initial: 1.5),
        ],
        xDomain: -4...8, yDomain: 0...40,
        curves: [.init(name: "f") { x, p in p[0] * pow(p[1], x) }],
        latex: { p in "y = \(F.number(p[0])) \\cdot \(F.number(p[1]))^x" },
        horizontalLine: { _ in (0, "asymptoot $y = 0$") },
        points: { p in [(0, p[0], "beginwaarde")] },
        info: { p in
            let g = p[1]
            if g > 1 {
                return "Groei van $\(F.percent(g - 1))$ per tijdseenheid. Verdubbelingstijd $= \\glog{\(F.number(g))}(2) \\approx \(F.number(log(2) / log(g)))$."
            }
            if g < 1 {
                return "Afname van $\(F.percent(1 - g))$ per tijdseenheid. Halveringstijd $= \\glog{\(F.number(g))}(0,5) \\approx \(F.number(log(0.5) / log(g)))$."
            }
            return "$g = 1$: constant, geen groei."
        }
    )

    static let logarithm = FunctionGraph(
        title: "Logaritmische functie",
        parameters: [
            GraphParameter(name: "grondtal $g$", range: 0.2...10, step: 0.1, initial: 2),
        ],
        xDomain: 0...10, yDomain: -5...5,
        curves: [.init(name: "f") { x, p in x <= 0 || p[0] == 1 ? .nan : log(x) / log(p[0]) }],
        latex: { p in "y = \\glog{\(F.number(p[0]))}(x)" },
        verticalLine: { _ in (0, "asymptoot $x = 0$") },
        points: { _ in [(1, 0, "(1, 0)")] },
        info: { p in
            if p[0] > 1 { return "$g > 1$: afnemend stijgend. Altijd door $(1, 0)$ en $(g, 1)$." }
            if p[0] < 1 { return "$0 < g < 1$: dalend. Altijd door $(1, 0)$ en $(g, 1)$." }
            return "$g = 1$ is geen geldig grondtal."
        }
    )

    static let sine = FunctionGraph(
        title: "Sinusoïde",
        parameters: [
            GraphParameter(name: "evenwichtsstand $a$", range: -3...3, step: 0.5, initial: 1),
            GraphParameter(name: "amplitude $b$", range: 0.5...4, step: 0.5, initial: 2),
            GraphParameter(name: "$c$", range: 0.25...3, step: 0.25, initial: 1),
            GraphParameter(name: "horizontale verschuiving $d$", range: -3...3, step: 0.25, initial: 0),
        ],
        xDomain: -1...13, yDomain: -7...7,
        curves: [.init(name: "f") { x, p in p[0] + p[1] * sin(p[2] * (x - p[3])) }],
        latex: { p in
            let inner = p[3] == 0 ? "x" : "(x\(F.signed(-p[3])))"
            return "y = \(F.number(p[0]))\(F.signed(p[1])) \\sin(\(F.coefficient(p[2]))\(inner))"
        },
        horizontalLine: { p in (p[0], "evenwichtsstand") },
        points: { p in [(p[3], p[0], "start omhoog")] },
        info: { p in "Periode $= \\frac{2\\pi}{c} \\approx \(F.number(2 * .pi / p[2]))$. Max $= a + b = \(F.number(p[0] + p[1]))$, min $= a - b = \(F.number(p[0] - p[1]))$." }
    )

    static let transformations = FunctionGraph(
        title: "Verschuiven en herschalen",
        parameters: [
            GraphParameter(name: "herschalen verticaal $a$", range: -3...3, step: 0.25, initial: 1),
            GraphParameter(name: "herschalen horizontaal $c$", range: 0.25...3, step: 0.25, initial: 1),
            GraphParameter(name: "naar rechts $p$", range: -4...4, step: 0.5, initial: 2),
            GraphParameter(name: "omhoog $q$", range: -4...4, step: 0.5, initial: -1),
        ],
        xDomain: -6...6, yDomain: -6...8,
        curves: [
            .init(name: "origineel", f: { x, _ in x * x }, isReference: true),
            .init(name: "nieuw") { x, p in p[0] * pow((x - p[2]) / p[1], 2) + p[3] },
        ],
        latex: { p in
            let shifted = p[2] == 0 ? "x" : "x\(F.signed(-p[2]))"
            let inner = p[1] == 1 ? shifted : "\\frac{\(shifted)}{\(F.number(p[1]))}"
            let square = p[1] == 1 && p[2] == 0 ? "x^2" : "\\left(\(inner)\\right)^2"
            return "y = \(F.coefficient(p[0]))\(square)\(F.signed(p[3]))"
        },
        info: { _ in "Origineel (grijs): $y = x^2$. Vermenigvuldig met $a$ ↕, vervang $x$ door $\\frac{x}{c}$ ↔, $x$ door $x - p$ (naar rechts) en tel $q$ op (omhoog)." }
    )

    static let inverseProportional = FunctionGraph(
        title: "Omgekeerd evenredig",
        parameters: [GraphParameter(name: "$a$", range: 0.5...10, step: 0.5, initial: 4)],
        xDomain: 0...10, yDomain: 0...10,
        curves: [.init(name: "f") { x, p in x <= 0 ? .nan : p[0] / x }],
        latex: { p in "y = \\frac{\(F.number(p[0]))}{x}" },
        info: { p in "$x \\cdot y = \(F.number(p[0]))$ is constant: wordt $x$ twee keer zo groot, dan wordt $y$ twee keer zo klein." }
    )

    /// f(x) = 0,1x³ − x + 2, with a secant through x₀ and x₀ + h and the tangent at x₀.
    static let tangent = FunctionGraph(
        title: "Differentiequotiënt en raaklijn",
        parameters: [
            GraphParameter(name: "$x_0$", range: -4...4, step: 0.1, initial: 1),
            GraphParameter(name: "$\\Delta x$", range: 0.1...4, step: 0.1, initial: 2),
        ],
        xDomain: -5...5, yDomain: -6...10,
        curves: [.init(name: "f") { x, _ in tangentF(x) }],
        latex: { _ in "f(x) = 0,1x^3 - x + 2" },
        points: { p in [(p[0], tangentF(p[0]), "A"), (p[0] + p[1], tangentF(p[0] + p[1]), "B")] },
        segments: { p in
            let x0 = p[0], x1 = p[0] + p[1]
            let slope = tangentDF(x0)
            let secantSlope = (tangentF(x1) - tangentF(x0)) / (x1 - x0)
            return [
                (x0 - 3, tangentF(x0) - 3 * slope, x0 + 3, tangentF(x0) + 3 * slope, "raaklijn"),
                (x0 - 1, tangentF(x0) - secantSlope, x1 + 1, tangentF(x1) + secantSlope, "lijn AB"),
            ]
        },
        info: { p in
            let x0 = p[0], x1 = p[0] + p[1]
            let dq = (tangentF(x1) - tangentF(x0)) / (x1 - x0)
            return "$\\frac{\\Delta y}{\\Delta x} \\approx \(F.number(dq))$, helling raaklijn $f'(\(F.number(x0, digits: 1))) \\approx \(F.number(tangentDF(x0)))$. Maak $\\Delta x$ klein: het differentiequotiënt nadert de helling."
        }
    )

    @Sendable static func tangentF(_ x: Double) -> Double { 0.1 * x * x * x - x + 2 }
    @Sendable static func tangentDF(_ x: Double) -> Double { 0.3 * x * x - 1 }

    static let slopeGraph = FunctionGraph(
        title: "Grafiek en hellinggrafiek",
        parameters: [GraphParameter(name: "$x$", range: -4...4, step: 0.1, initial: -1)],
        xDomain: -5...5, yDomain: -6...10,
        curves: [
            .init(name: "f") { x, _ in tangentF(x) },
            .init(name: "f′ (helling)") { x, _ in tangentDF(x) },
        ],
        latex: { _ in "f(x) = 0,1x^3 - x + 2 \\qquad f'(x) = 0,3x^2 - 1" },
        points: { p in [(p[0], tangentF(p[0]), "f"), (p[0], tangentDF(p[0]), "f′")] },
        info: { p in
            let d = tangentDF(p[0])
            let behaviour = abs(d) < 0.05 ? "horizontaal: mogelijk een top" : (d > 0 ? "stijgend" : "dalend")
            return "Bij $x = \(F.number(p[0], digits: 1))$ is de helling $\(F.number(d))$: de grafiek is \(behaviour). Top van $f$ ↔ nulpunt van $f'$."
        }
    )

    static let logScale = FunctionGraph(
        title: "Logaritmische schaalverdeling",
        parameters: [
            GraphParameter(name: "beginwaarde $b$", range: 1...20, step: 1, initial: 5),
            GraphParameter(name: "groeifactor $g$", range: 1.1...3, step: 0.1, initial: 2),
        ],
        xDomain: 0...10, yDomain: 1...100_000,
        curves: [.init(name: "f") { x, p in p[0] * pow(p[1], x) }],
        latex: { p in "y = \(F.number(p[0])) \\cdot \(F.number(p[1]))^x" },
        info: { _ in "Op een logaritmische $y$-as wordt exponentiële groei een rechte lijn. Elke streep is een factor $10$ groter." },
        logarithmicY: true
    )
}
