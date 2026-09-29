"""Lint the visible copy of an HTML page against the portfolio voice guide.

Usage: python3 lint_copy.py index.html
"""
import re
import sys
from collections import Counter
from html.parser import HTMLParser

BANNED = [
    "leverage", "seamless", "seamlessly", "robust", "cutting-edge", "passionate", "innovative",
    "elevate", "unlock", "empower", "revolutionize", "game-changer", "game changer", "dive in",
    "journey", "world-class", "synergy", "next-level", "delve", "effortless", "effortlessly",
    "in today's", "whether you're", "look no further", "take it to the next level",
]
PATTERNS = [
    (r"\bnot just\b.{0,40}\bit'?s\b", "formulaic 'not just X, it's Y'"),
    (r"\bNo \w+\. No \w+\.", "formulaic 'No A. No B.'"),
    (r"\?\s+[A-Z][^.?!]{0,60}\.", "question answered by the next sentence"),
]
SKIP_TAGS = {"script", "style", "svg", "head", "title"}


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.blocks = []
        self.buf = []

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            self.skip += 1
        attrs = dict(attrs)
        if attrs.get("aria-hidden") == "true" and tag == "span":
            self.buf.append(" ")

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS:
            self.skip -= 1
        if tag in {"p", "h1", "h2", "h3", "h4", "li", "a", "button", "dd", "dt", "figcaption", "span"}:
            self.flush()

    def handle_data(self, data):
        if not self.skip:
            self.buf.append(data)

    def flush(self):
        text = re.sub(r"\s+", " ", "".join(self.buf)).strip()
        if text:
            self.blocks.append(text)
        self.buf = []


def main(path):
    parser = Text()
    parser.feed(open(path, encoding="utf-8").read())
    parser.flush()
    blocks = [b for b in parser.blocks if len(b) > 2]
    body = "\n".join(blocks)
    errors = warnings = 0

    def report(level, msg, where):
        nonlocal errors, warnings
        if level == "error":
            errors += 1
        else:
            warnings += 1
        print(f"{level.upper():7} {msg}\n        ↳ {where[:110]}")

    for b in blocks:
        low = b.lower()
        for w in BANNED:
            if re.search(r"(?<![\w-])" + re.escape(w) + r"(?![\w-])", low):
                report("error", f"banned word/phrase '{w}'", b)
        if "—" in b:
            report("error", "em dash (use a period or comma)", b)
        if "!" in b:
            report("error", "exclamation mark", b)
        for rx, why in PATTERNS:
            if re.search(rx, b):
                report("warn", why, b)
        for s in re.split(r"(?<=[.?!])\s+", b):
            n = len(s.split())
            if n > 28:
                report("warn", f"long sentence ({n} words)", s)
            if re.search(r"\b\w+(?: \w+){0,2}, \w+(?: \w+){0,2},? and \w+", s):
                report("warn", "triplet list, is the third item earning its place?", s)

    # repeated 3-word phrases across different blocks
    grams = Counter()
    for b in set(blocks):
        words = re.findall(r"[a-z0-9+']+", b.lower())
        seen = set()
        for i in range(len(words) - 2):
            g = " ".join(words[i:i + 3])
            if g not in seen:
                seen.add(g)
                grams[g] += 1
    stop = {"i build a", "on the app", "the app store"}
    for g, n in grams.most_common():
        if n < 2:
            break
        if g not in stop:
            report("warn", f"phrase repeated in {n} places: '{g}'", g)

    for fact in [r"4\+? years", r"four years"]:
        n = len(re.findall(fact, body, re.I))
        if n > 1:
            report("warn", f"'{fact}' appears {n} times; say it once", fact)

    words = len(re.findall(r"\w+", body))
    print(f"\n{len(blocks)} text blocks, {words} words · {errors} errors, {warnings} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "index.html"))
