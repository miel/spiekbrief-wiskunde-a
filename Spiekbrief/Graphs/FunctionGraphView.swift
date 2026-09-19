import Accessibility
import Charts
import SwiftUI

struct FunctionGraphView: View {
    let graph: FunctionGraph
    let chartHeight: CGFloat
    @State private var values: [Double]

    /// Samples per curve. 160 is smooth at 343 pt wide and cheap enough to redraw per slider tick.
    static let sampleCount = 160

    init(graph: FunctionGraph, chartHeight: CGFloat) {
        self.graph = graph
        self.chartHeight = chartHeight
        _values = State(initialValue: graph.parameters.map(\.initial))
    }

    struct Sample: Identifiable {
        let id: Int
        let curve: Int
        /// Increments where the function is undefined, so the line is not drawn across a gap.
        let segment: Int
        let x: Double
        let y: Double
        var series: String { "\(curve)-\(segment)" }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(graph.title)
                .font(.subheadline.weight(.semibold))
            FormulaView(latex: graph.latex(values), spoken: LatexSpeech.approximate(graph.latex(values)))
            chart
                .frame(height: chartHeight)
            if graph.curves.count > 1 { legend }
            ForEach(graph.parameters.indices, id: \.self) { index in
                let parameter = graph.parameters[index]
                ParameterSlider(name: parameter.name, value: $values[index], range: parameter.range, step: parameter.step)
            }
            if let info = graph.info?(values) {
                MathText(info, style: .footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var samples: [Sample] {
        let (x0, x1) = (graph.xDomain.lowerBound, graph.xDomain.upperBound)
        let yLimit = 50 * max(abs(graph.yDomain.lowerBound), abs(graph.yDomain.upperBound))
        var result: [Sample] = []
        result.reserveCapacity(Self.sampleCount * graph.curves.count)
        for (c, curve) in graph.curves.enumerated() {
            var segment = 0
            var inGap = false
            for i in 0...Self.sampleCount {
                let x = x0 + (x1 - x0) * Double(i) / Double(Self.sampleCount)
                let y = curve.f(x, values)
                let valid = y.isFinite && abs(y) < yLimit && (!graph.logarithmicY || y > 0)
                if valid {
                    if inGap { segment += 1; inGap = false }
                    result.append(Sample(id: result.count, curve: c, segment: segment, x: x, y: y))
                } else {
                    inGap = true
                }
            }
        }
        return result
    }

    private var chart: some View {
        Chart {
            ForEach(samples) { sample in
                LineMark(x: .value("x", sample.x), y: .value("y", sample.y), series: .value("grafiek", sample.series))
                    .foregroundStyle(graph.curves[sample.curve].isReference ? Color.gray : GraphPalette.color(sample.curve))
                    .lineStyle(graph.curves[sample.curve].isReference
                               ? StrokeStyle(lineWidth: 1.5, dash: [5, 4])
                               : StrokeStyle(lineWidth: 2.5, lineCap: .round))
                    .interpolationMethod(.linear)
            }
            if let line = graph.horizontalLine?(values) {
                RuleMark(y: .value("y", line.value))
                    .foregroundStyle(.secondary)
                    .lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 3]))
                    .annotation(position: .top, alignment: .trailing) {
                        MathText(line.label, style: .caption2).foregroundStyle(.secondary)
                    }
            }
            if let line = graph.verticalLine?(values) {
                RuleMark(x: .value("x", line.value))
                    .foregroundStyle(.secondary)
                    .lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 3]))
                    .annotation(position: .trailing, alignment: .top) {
                        MathText(line.label, style: .caption2).foregroundStyle(.secondary)
                    }
            }
            if let segments = graph.segments?(values) {
                ForEach(segments.indices, id: \.self) { index in
                    let s = segments[index]
                    LineMark(x: .value("x", s.x1), y: .value("y", s.y1), series: .value("lijn", "s\(index)"))
                        .foregroundStyle(Color.red)
                        .lineStyle(StrokeStyle(lineWidth: 1.5))
                    LineMark(x: .value("x", s.x2), y: .value("y", s.y2), series: .value("lijn", "s\(index)"))
                        .foregroundStyle(Color.red)
                        .lineStyle(StrokeStyle(lineWidth: 1.5))
                        .annotation(position: .top) { Text(s.label).font(.caption2) }
                }
            }
            if let points = graph.points?(values) {
                ForEach(points.indices, id: \.self) { index in
                    let point = points[index]
                    if graph.xDomain.contains(point.x), graph.yDomain.contains(point.y) {
                        PointMark(x: .value("x", point.x), y: .value("y", point.y))
                            .foregroundStyle(Color.primary)
                            .symbolSize(40)
                            .annotation(position: .topTrailing, spacing: 2) {
                                Text(point.label).font(.caption2.weight(.medium))
                            }
                    }
                }
            }
        }
        .chartXScale(domain: graph.xDomain)
        .chartYScale(domain: graph.yDomain, type: graph.logarithmicY ? .log : .linear)
        .chartPlotStyle { $0.clipped() }
        .chartXAxisLabel("x", alignment: .trailing)
        .chartYAxisLabel("y", alignment: .top)
        .accessibilityChartDescriptor(FunctionChartDescriptor(graph: graph, values: values))
    }

    private var legend: some View {
        HStack(spacing: 16) {
            ForEach(graph.curves.indices, id: \.self) { index in
                let curve = graph.curves[index]
                HStack(spacing: 6) {
                    Capsule()
                        .fill(curve.isReference ? Color.gray : GraphPalette.color(index))
                        .frame(width: 16, height: 3)
                    Text(curve.name).font(.caption)
                }
            }
        }
        .accessibilityHidden(true)
    }
}

/// Lets VoiceOver users explore the curves as audio graphs.
private struct FunctionChartDescriptor: AXChartDescriptorRepresentable {
    let graph: FunctionGraph
    let values: [Double]

    func makeChartDescriptor() -> AXChartDescriptor {
        let x = AXNumericDataAxisDescriptor(
            title: "x", range: graph.xDomain, gridlinePositions: []
        ) { GraphFormat.number($0) }
        let y = AXNumericDataAxisDescriptor(
            title: "y", range: graph.yDomain, gridlinePositions: []
        ) { GraphFormat.number($0) }
        let series = graph.curves.map { curve in
            let points = stride(from: graph.xDomain.lowerBound, through: graph.xDomain.upperBound,
                                by: (graph.xDomain.upperBound - graph.xDomain.lowerBound) / 40)
                .compactMap { xValue -> AXDataPoint? in
                    let yValue = curve.f(xValue, values)
                    return yValue.isFinite ? AXDataPoint(x: xValue, y: yValue) : nil
                }
            return AXDataSeriesDescriptor(name: curve.name, isContinuous: true, dataPoints: points)
        }
        return AXChartDescriptor(
            title: graph.title,
            summary: LatexSpeech.approximate(graph.latex(values)),
            xAxis: x, yAxis: y, additionalAxes: [], series: series)
    }
}
