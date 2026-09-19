import Foundation

/// Turns simple LaTeX into Dutch words for VoiceOver.
///
/// Display formulas in the content carry a hand-written `spoken` text; this is only the
/// fallback for inline math, where a rough reading ("x tot de macht 2") beats silence.
enum LatexSpeech {
    private static let words: [(String, String)] = [
        ("\\cdot", " keer "), ("\\times", " keer "),
        ("\\Leftrightarrow", " is gelijkwaardig aan "), ("\\Rightarrow", " dus "),
        ("\\approx", " is ongeveer "), ("\\neq", " is niet gelijk aan "),
        ("\\leq", " kleiner dan of gelijk aan "), ("\\geq", " groter dan of gelijk aan "),
        ("\\pm", " plus of min "), ("\\Delta", " delta "), ("\\sum", " som "),
        ("\\sigma", " sigma "), ("\\mu", " mu "), ("\\pi", " pi "), ("\\infty", " oneindig "),
        ("\\ln", " ln "), ("\\log", " log "), ("\\sin", " sinus "),
        ("\\pct", " procent "), ("\\%", " procent "),
        ("\\bar", " gemiddelde "), ("\\hat", " dakje "),
        ("'", " accent "), ("<", " kleiner dan "), (">", " groter dan "),
        ("=", " is "), ("+", " plus "), ("-", " min "), ("/", " gedeeld door "),
    ]

    static func approximate(_ latex: String) -> String {
        var s = LatexPreprocessor.replaceMacro("glog", in: latex) { " \($0) log " }
        s = LatexPreprocessor.replaceMacro("sqrt", in: s) { " wortel \($0) " }
        s = replaceFractions(s)
        s = LatexPreprocessor.replaceMacro("text", in: s) { $0 }
        s = s.replacingOccurrences(of: "^{-1}", with: " tot de macht min 1 ")
        s = s.replacingOccurrences(of: "^2", with: " kwadraat ")
        s = s.replacingOccurrences(of: "^", with: " tot de macht ")
        s = s.replacingOccurrences(of: "_", with: " ")
        for (command, word) in words {
            s = s.replacingOccurrences(of: command, with: word)
        }
        s = s.replacingOccurrences(of: "\\", with: " ")
        s = s.filter { !"{}".contains($0) }
        return s.split(separator: " ").joined(separator: " ")
    }

    /// `\frac{a}{b}` → "a gedeeld door b".
    private static func replaceFractions(_ latex: String) -> String {
        var s = latex
        for command in ["\\dfrac{", "\\frac{"] {
            while let start = s.range(of: command) {
                guard let (numerator, afterNumerator) = group(in: s, from: start.upperBound),
                      afterNumerator < s.endIndex, s[afterNumerator] == "{",
                      let (denominator, end) = group(in: s, from: s.index(after: afterNumerator))
                else { return s }
                s.replaceSubrange(start.lowerBound..<end, with: " (\(numerator)) gedeeld door (\(denominator)) ")
            }
        }
        return s
    }

    /// Reads a brace group whose opening brace is just before `start`; returns its content and
    /// the index after the closing brace.
    private static func group(in s: String, from start: String.Index) -> (String, String.Index)? {
        var depth = 1
        var index = start
        while index < s.endIndex {
            switch s[index] {
            case "{": depth += 1
            case "}":
                depth -= 1
                if depth == 0 { return (String(s[start..<index]), s.index(after: index)) }
            default: break
            }
            index = s.index(after: index)
        }
        return nil
    }
}
