import Charts
import SwiftUI

private typealias F = GraphFormat

// MARK: - Toenamediagram

/// Logistic growth with its increase diagram: bars of Δy per interval of width Δx.
struct IncreaseDiagramView: View {
    let chartHeight: CGFloat
    @State private var stepIndex = 1

    private static let steps: [Double] = [0.5, 1, 2]
    private static let domain: ClosedRange<Double> = 0...8

    static func f(_ x: Double) -> Double { 20 / (1 + 9 * exp(-x)) }

    private struct Bar: Identifiable {
        let id: Int
        let start: Double
        let end: Double
        let increase: Double
    }

    private var step: Double { Self.steps[stepIndex] }

    private var bars: [Bar] {
        stride(from: Self.domain.lowerBound, to: Self.domain.upperBound - 1e-9, by: step)
            .enumerated()
            .map { i, x in Bar(id: i, start: x, end: x + step, increase: Self.f(x + step) - Self.f(x)) }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Toenamediagram").font(.subheadline.weight(.semibold))
            FormulaView(latex: "f(x) = \\frac{20}{1 + 9 \\cdot e^{-x}}", spoken: "f van x is 20 gedeeld door 1 plus 9 keer e tot de macht min x")
            Chart {
                ForEach(0...80, id: \.self) { i in
                    let x = Double(i) / 10
                    LineMark(x: .value("x", x), y: .value("f(x)", Self.f(x)))
                        .foregroundStyle(.blue)
                }
                ForEach(bars) { bar in
                    PointMark(x: .value("x", bar.start), y: .value("f(x)", Self.f(bar.start)))
                        .symbolSize(20)
                        .foregroundStyle(.blue)
                }
            }
            .chartXScale(domain: Self.domain)
            .chartYScale(domain: 0...21)
            .frame(height: chartHeight * 0.6)
            .accessibilityLabel("Grafiek van f: S-vormige groei van 2 naar 20")

            Chart(bars) { bar in
                BarMark(
                    xStart: .value("van", bar.start + step * 0.08),
                    xEnd: .value("tot", bar.end - step * 0.08),
                    y: .value("toename", bar.increase)
                )
                .foregroundStyle(.orange)
                .accessibilityLabel("Van \(F.number(bar.start)) tot \(F.number(bar.end))")
                .accessibilityValue("toename \(F.number(bar.increase))")
            }
            .chartXScale(domain: Self.domain)
            .chartYAxisLabel("Δy", alignment: .top)
            .frame(height: chartHeight * 0.5)

            Picker("Stapgrootte Δx", selection: $stepIndex.animation()) {
                ForEach(Self.steps.indices, id: \.self) { i in
                    Text("Δx = \(F.number(Self.steps[i]))").tag(i)
                }
            }
            .pickerStyle(.segmented)

            MathText("De staven worden eerst **hoger** (toenemend stijgend) en na $x \\approx 2,2$ **lager** (afnemend stijgend). Waar de staven het hoogst zijn, stijgt $f$ het snelst.", style: .footnote)
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Recursieve rij

/// uₙ = r · uₙ₋₁ + b, with its limit when |r| < 1.
struct RecursiveSequenceView: View {
    let chartHeight: CGFloat
    @State private var u0 = 100.0
    @State private var r = 0.8
    @State private var b = 50.0

    private static let lastN = 20

    private var terms: [Double] {
        var terms = [u0]
        for _ in 1...Self.lastN { terms.append(r * terms[terms.count - 1] + b) }
        return terms
    }

    private var limit: Double? { abs(r) < 1 ? b / (1 - r) : nil }

    var body: some View {
        let terms = self.terms
        VStack(alignment: .leading, spacing: 12) {
            Text("Recursieve formule").font(.subheadline.weight(.semibold))
            FormulaView(latex: "u_n = \(F.number(r)) \\cdot u_{n-1}\(F.signed(b)) \\qquad u_0 = \(F.number(u0))")
            Chart {
                ForEach(terms.indices, id: \.self) { n in
                    let u = terms[n]
                    LineMark(x: .value("n", n), y: .value("u", u))
                        .foregroundStyle(.blue.opacity(0.4))
                    PointMark(x: .value("n", n), y: .value("u", u))
                        .foregroundStyle(.blue)
                        .symbolSize(24)
                }
                if let limit {
                    RuleMark(y: .value("grenswaarde", limit))
                        .foregroundStyle(.secondary)
                        .lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 3]))
                        .annotation(position: .top, alignment: .trailing) {
                            Text("grenswaarde \(F.number(limit))").font(.caption2).foregroundStyle(.secondary)
                        }
                }
            }
            .chartXScale(domain: 0...Self.lastN)
            .chartXAxisLabel("n", alignment: .trailing)
            .frame(height: chartHeight)
            ParameterSlider(name: "startwaarde $u_0$", value: $u0, range: 0...400, step: 10)
            ParameterSlider(name: "factor $r$", value: $r, range: 0...1.3, step: 0.05)
            ParameterSlider(name: "constante $b$", value: $b, range: -50...100, step: 5)
            MathText(explanation(terms), style: .footnote)
                .foregroundStyle(.secondary)
        }
    }

    private func explanation(_ terms: [Double]) -> String {
        let u20 = "$u_{20} \\approx \(F.number(terms[Self.lastN], digits: 1))$."
        if let limit {
            return "Omdat $0 \\leq r < 1$ nadert de rij de grenswaarde $\\frac{b}{1 - r} = \(F.number(limit, digits: 1))$. Die volgt uit $u = r \\cdot u + b$. \(u20)"
        }
        return "Bij $r \\geq 1$ is er geen grenswaarde. \(u20)"
    }
}

// MARK: - Normale verdeling

struct NormalDistributionView: View {
    let chartHeight: CGFloat
    @State private var mu = 175.0
    @State private var sigma = 7.0
    @State private var low = 168.0
    @State private var high = 182.0

    private static let domain: ClosedRange<Double> = 130...220

    static func density(_ x: Double, mu: Double, sigma: Double) -> Double {
        exp(-0.5 * pow((x - mu) / sigma, 2)) / (sigma * (2 * .pi).squareRoot())
    }

    static func cdf(_ x: Double, mu: Double, sigma: Double) -> Double {
        0.5 * erfc(-(x - mu) / (sigma * 2.0.squareRoot()))
    }

    private var probability: Double {
        let (a, b) = (min(low, high), max(low, high))
        return Self.cdf(b, mu: mu, sigma: sigma) - Self.cdf(a, mu: mu, sigma: sigma)
    }

    var body: some View {
        let (a, b) = (min(low, high), max(low, high))
        let xs = stride(from: Self.domain.lowerBound, through: Self.domain.upperBound, by: 0.5).map { $0 }
        VStack(alignment: .leading, spacing: 12) {
            Text("Normale verdeling").font(.subheadline.weight(.semibold))
            FormulaView(latex: "P(\(F.number(a, digits: 1)) < X < \(F.number(b, digits: 1))) \\approx \(F.number(probability, digits: 3))")
            Chart {
                ForEach(xs.filter { $0 >= a && $0 <= b }, id: \.self) { x in
                    AreaMark(x: .value("x", x), y: .value("dichtheid", Self.density(x, mu: mu, sigma: sigma)))
                        .foregroundStyle(.blue.opacity(0.3))
                }
                ForEach(xs, id: \.self) { x in
                    LineMark(x: .value("x", x), y: .value("dichtheid", Self.density(x, mu: mu, sigma: sigma)))
                        .foregroundStyle(.blue)
                }
                RuleMark(x: .value("μ", mu))
                    .foregroundStyle(.secondary)
                    .lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 3]))
                    .annotation(position: .top) { Text("μ").font(.caption2) }
            }
            .chartXScale(domain: Self.domain)
            .chartYAxis(.hidden)
            .frame(height: chartHeight)
            .accessibilityLabel("Normale kromme met gemiddelde \(F.number(mu)) en standaardafwijking \(F.number(sigma))")
            .accessibilityValue("Gearceerde kans \(F.number(probability, digits: 3))")
            ParameterSlider(name: "gemiddelde $\\mu$", value: $mu, range: 150...200, step: 1, digits: 0)
            ParameterSlider(name: "standaardafwijking $\\sigma$", value: $sigma, range: 2...15, step: 0.5, digits: 1)
            ParameterSlider(name: "linkergrens", value: $low, range: Self.domain, step: 0.5, digits: 1)
            ParameterSlider(name: "rechtergrens", value: $high, range: Self.domain, step: 0.5, digits: 1)
            MathText("Vuistregels: tussen $\\mu \\pm \\sigma$ ligt $68\\pct$, tussen $\\mu \\pm 2\\sigma$ ligt $95\\pct$. Hier: $z$-waarden $\(F.number((a - mu) / sigma))$ en $\(F.number((b - mu) / sigma))$.", style: .footnote)
                .foregroundStyle(.secondary)
            HStack {
                Button("μ ± σ") { withAnimation { low = mu - sigma; high = mu + sigma } }
                Button("μ ± 2σ") { withAnimation { low = mu - 2 * sigma; high = mu + 2 * sigma } }
                Button("μ ± 3σ") { withAnimation { low = mu - 3 * sigma; high = mu + 3 * sigma } }
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
    }
}

// MARK: - Binomiale verdeling

struct BinomialDistributionView: View {
    enum Mode: String, CaseIterable, Identifiable {
        case equal = "P(X = k)"
        case atMost = "P(X ≤ k)"
        case atLeast = "P(X ≥ k)"
        var id: Self { self }

        var latexSymbol: String {
            switch self {
            case .equal: "="
            case .atMost: "\\leq"
            case .atLeast: "\\geq"
            }
        }
    }

    let chartHeight: CGFloat
    @State private var n = 20.0
    @State private var p = 0.3
    @State private var k = 6.0
    @State private var mode = Mode.atMost

    static func pmf(_ k: Int, n: Int, p: Double) -> Double {
        guard k >= 0, k <= n else { return 0 }
        if p == 0 { return k == 0 ? 1 : 0 }
        if p == 1 { return k == n ? 1 : 0 }
        let logChoose = lgamma(Double(n + 1)) - lgamma(Double(k + 1)) - lgamma(Double(n - k + 1))
        return exp(logChoose + Double(k) * log(p) + Double(n - k) * log(1 - p))
    }

    private func isIncluded(_ value: Int) -> Bool {
        switch mode {
        case .equal: value == Int(k)
        case .atMost: value <= Int(k)
        case .atLeast: value >= Int(k)
        }
    }

    var body: some View {
        let nInt = Int(n)
        let probabilities = (0...nInt).map { Self.pmf($0, n: nInt, p: p) }
        let total = probabilities.indices.filter(isIncluded).map { probabilities[$0] }.reduce(0, +)
        let symbol = mode.latexSymbol
        VStack(alignment: .leading, spacing: 12) {
            Text("Binomiale verdeling").font(.subheadline.weight(.semibold))
            FormulaView(latex: "P(X \(symbol) \(Int(k))) \\approx \(F.number(total, digits: 4))")
            Chart {
                ForEach(probabilities.indices, id: \.self) { value in
                    BarMark(x: .value("k", value), y: .value("kans", probabilities[value]))
                        .foregroundStyle(isIncluded(value) ? Color.blue : Color.gray.opacity(0.35))
                }
            }
            .frame(height: chartHeight)
            .accessibilityLabel("Kansen van de binomiale verdeling met n is \(nInt) en p is \(F.number(p))")
            .accessibilityValue("\(mode.rawValue) met k is \(Int(k)): \(F.number(total, digits: 4))")
            Picker("Kans", selection: $mode) {
                ForEach(Mode.allCases) { Text($0.rawValue).tag($0) }
            }
            .pickerStyle(.segmented)
            ParameterSlider(name: "aantal $n$", value: $n, range: 1...50, step: 1, digits: 0)
            ParameterSlider(name: "kans op succes $p$", value: $p, range: 0.01...0.99, step: 0.01)
            ParameterSlider(name: "$k$", value: $k, range: 0...n, step: 1, digits: 0)
            MathText("$E(X) = n \\cdot p = \(F.number(n * p))$ en $\\sigma(X) = \\sqrt{n \\cdot p \\cdot (1 - p)} \\approx \(F.number((n * p * (1 - p)).squareRoot()))$.", style: .footnote)
                .foregroundStyle(.secondary)
        }
        .onChange(of: n) { _, newValue in k = min(k, newValue) }
    }
}
