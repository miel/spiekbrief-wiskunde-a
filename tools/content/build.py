#!/usr/bin/env python3
"""Validates the content and writes it as JSON into Spiekbrief/Resources/Content.

Run from the repository root:  python3 tools/content/build.py
The Swift tests (ContentDecodingTests, FormulaLintTests) check the same files again on iOS,
including that every formula actually typesets.
"""

import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))

import domain_b  # noqa: E402
import domain_c  # noqa: E402
import domain_d  # noqa: E402
import domain_e  # noqa: E402
import examentips  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "Spiekbrief" / "Resources" / "Content"

FILES = {
    "B_algebra_tellen": domain_b.DOMAIN,
    "C_verbanden": domain_c.DOMAIN,
    "D_verandering": domain_d.DOMAIN,
    "E_statistiek": domain_e.DOMAIN,
    "examentips": examentips.DOMAIN,
}

# Keep in sync with GraphLibrary.allIDs.
GRAPH_IDS = {
    "lineair", "kwadratisch", "macht", "exponentieel", "logaritme", "sinus", "transformaties",
    "omgekeerd-evenredig", "raaklijn", "hellinggrafiek", "logschaal", "toenamediagram",
    "rij-recursief", "normaal", "binomiaal",
}
BADGES = {"formulelijst", "paraat", "se", "extra"}


def balanced_braces(latex):
    depth = 0
    escaped = False
    for ch in latex:
        if escaped:
            escaped = False
            continue
        if ch == "\\":
            escaped = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth < 0:
                return False
    return depth == 0


def inline_math(s):
    """Returns the $...$ segments of a text, or None if the dollars are unbalanced."""
    parts = s.split("$")
    if len(parts) % 2 == 0:
        return None
    return parts[1::2]


def texts_of(block):
    kind = block["type"]
    if kind in ("text", "heading", "tip", "warning"):
        yield block["text"]
    elif kind == "formula":
        for key in ("caption", "condition", "question"):
            if key in block:
                yield block[key]
    elif kind == "example":
        yield block["title"]
        yield block["problem"]
        for step in block["steps"]:
            yield step["text"]
    elif kind == "numworks":
        yield from block["steps"]
        if "note" in block:
            yield block["note"]
    elif kind == "table":
        yield from block["headers"]
        for row in block["rows"]:
            yield from row
        if "caption" in block:
            yield block["caption"]


def validate(files):
    errors = []
    topic_ids, formula_ids = set(), set()
    for name, domain in files.items():
        for topic in domain["topics"]:
            where = f"{name}/{topic['id']}"
            if topic["id"] in topic_ids:
                errors.append(f"{where}: duplicate topic id")
            topic_ids.add(topic["id"])
            if not topic["blocks"]:
                errors.append(f"{where}: no blocks")
            for s in [topic["summary"]]:
                if inline_math(s) is None:
                    errors.append(f"{where}: unbalanced $ in summary")
            for block in topic["blocks"]:
                if block["type"] == "formula":
                    fid = block["id"]
                    if fid in formula_ids:
                        errors.append(f"{where}: duplicate formula id {fid}")
                    formula_ids.add(fid)
                    if block["badge"] not in BADGES:
                        errors.append(f"{where}/{fid}: unknown badge {block['badge']}")
                    if not balanced_braces(block["latex"]):
                        errors.append(f"{where}/{fid}: unbalanced braces")
                    if "$" in block["latex"]:
                        errors.append(f"{where}/{fid}: $ inside display latex")
                    if re.search(r"(?<!\\)%", block["latex"]):
                        errors.append(f"{where}/{fid}: use \\pct instead of %")
                if block["type"] == "graph" and block["graph"] not in GRAPH_IDS:
                    errors.append(f"{where}: unknown graph {block['graph']}")
                if block["type"] == "example":
                    for step in block["steps"]:
                        if "latex" in step and not balanced_braces(step["latex"]):
                            errors.append(f"{where}: unbalanced braces in example step")
                for s in texts_of(block):
                    segments = inline_math(s)
                    if segments is None:
                        errors.append(f"{where}: unbalanced $ in: {s[:60]}")
                        continue
                    for m in segments:
                        if not balanced_braces(m):
                            errors.append(f"{where}: unbalanced braces in inline math: {m}")
    return errors, len(topic_ids), len(formula_ids)


def main():
    errors, topics, formulas = validate(FILES)
    if errors:
        print("\n".join(errors), file=sys.stderr)
        sys.exit(1)
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for name, domain in FILES.items():
        data = json.dumps(domain, ensure_ascii=False, indent=1) + "\n"
        (OUT / f"{name}.json").write_text(data, encoding="utf-8")
        total += len(data.encode())
    cards = sum(
        1 for d in FILES.values() for t in d["topics"] for b in t["blocks"]
        if b["type"] == "formula" and "question" in b
    )
    print(f"OK: {topics} topics, {formulas} formulas, {cards} flashcards, {total / 1024:.0f} KB")


if __name__ == "__main__":
    main()
