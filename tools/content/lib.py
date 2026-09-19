"""Helpers for authoring the app content in Python.

Content is written here with raw strings (r"...") so LaTeX stays readable, and `build.py`
turns it into the JSON files the app bundles. Conventions:

- Inline math in text goes between $...$.
- A decimal comma is written as in Dutch, "0,5". A comma directly between two digits
  becomes a decimal comma; write coordinates with a space: "(2, 3)".
- \\glog{g}(a) is the Dutch left-superscript log: ᵍlog(a). Use \\pct for a percent sign in math.
- Badges: "formulelijst" (bijlage 5 of the syllabus), "paraat" (know by heart),
  "se" (schoolexamen, domain E), "extra" (handy, not required).
"""


def text(s):
    return {"type": "text", "text": s}


def heading(s):
    return {"type": "heading", "text": s}


def formula(id, latex, spoken, badge="paraat", caption=None, condition=None, question=None):
    block = {"type": "formula", "id": id, "latex": latex, "spoken": spoken, "badge": badge}
    if caption:
        block["caption"] = caption
    if condition:
        block["condition"] = condition
    if question:
        block["question"] = question
    return block


def example(title, problem, steps):
    """steps: list of (text, latex or None)."""
    return {
        "type": "example",
        "title": title,
        "problem": problem,
        "steps": [{"text": t, **({"latex": l} if l else {})} for t, l in steps],
    }


def numworks(app, steps, note=None):
    block = {"type": "numworks", "app": app, "steps": steps}
    if note:
        block["note"] = note
    return block


def graph(id):
    return {"type": "graph", "graph": id}


def table(headers, rows, caption=None):
    block = {"type": "table", "headers": headers, "rows": rows}
    if caption:
        block["caption"] = caption
    return block


def tip(s):
    return {"type": "tip", "text": s}


def warning(s):
    return {"type": "warning", "text": s}


def topic(id, title, summary, syllabus_ref, keywords, blocks):
    return {
        "id": id,
        "title": title,
        "summary": summary,
        "syllabusRef": syllabus_ref,
        "keywords": keywords,
        "blocks": blocks,
    }


def domain(id, code, title, symbol, color, topics, school_exam_only=False):
    d = {"id": id, "code": code, "title": title, "symbol": symbol, "color": color, "topics": topics}
    if school_exam_only:
        d["schoolExamOnly"] = True
    return d
