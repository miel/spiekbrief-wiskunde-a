import Foundation

/// Rewrites the app's LaTeX dialect into plain LaTeX that SwiftMath understands.
///
/// Content authors use:
/// - `\glog{g}(a)` for the Dutch notation ᵍlog(a) with a left superscript, as in the syllabus.
/// - `3,5` for decimal numbers. A comma **directly between two digits** is a decimal comma and
///   becomes `3,\!5`: SwiftMath puts a thin space after punctuation, and `\!` cancels it.
///   A comma followed by a space, as in the point (2, 3), is left alone.
/// - `\pct` for a percent sign (`%` starts a comment in TeX).
enum LatexPreprocessor {
    static func process(_ source: String) -> String {
        var s = replaceMacro("glog", in: source) { "{}^{\($0)}\\!\\log" }
        s = decimalCommas(s)
        s = s.replacingOccurrences(of: "\\pct", with: "\\%")
        return s
    }

    /// Replaces `\name{arg}` with `transform(arg)`. Handles nested braces in the argument.
    static func replaceMacro(_ name: String, in source: String, transform: (String) -> String) -> String {
        let token = "\\" + name + "{"
        var result = ""
        var rest = Substring(source)
        while let range = rest.range(of: token) {
            result += rest[..<range.lowerBound]
            var depth = 1
            var index = range.upperBound
            while index < rest.endIndex, depth > 0 {
                switch rest[index] {
                case "{": depth += 1
                case "}": depth -= 1
                default: break
                }
                if depth > 0 { index = rest.index(after: index) }
            }
            guard index < rest.endIndex else {
                // Unbalanced braces: leave the rest untouched so the parse error surfaces in the lint test.
                result += rest
                return result
            }
            result += transform(String(rest[range.upperBound..<index]))
            rest = rest[rest.index(after: index)...]
        }
        return result + rest
    }

    static func decimalCommas(_ source: String) -> String {
        let chars = Array(source)
        var out = ""
        out.reserveCapacity(chars.count + 8)
        for (i, c) in chars.enumerated() {
            if c == ",", i > 0, i + 1 < chars.count, chars[i - 1].isASCIIDigit, chars[i + 1].isASCIIDigit {
                out += ",\\!"
            } else {
                out.append(c)
            }
        }
        return out
    }
}

private extension Character {
    var isASCIIDigit: Bool { isASCII && isNumber }
}
