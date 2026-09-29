---
name: portfolio-copy
description: Voice guide and copy linter for Adrian's portfolio site. Use whenever writing or editing any visible text on the site (index.html) — project blurbs, headings, about, contact, button labels — and run the linter before committing.
---

# Portfolio copy

The site should read like Adrian talking to a smart friend: relaxed, plain, specific.
Every sentence has to earn its place by telling the reader something they didn't know.

## Voice

- **Plain words, short sentences.** Say what the thing does. "Log a whole meal in one tap"
  beats "streamlined meal-logging experience".
- **Specific over impressive.** Concrete nouns and real details (BTC and MNQ, a pixel pig,
  sleep stages) do the selling. No adjectives doing the work of facts.
- **A little dry, a little warm.** One light touch of personality per section is plenty.
- **First person, casual.** "I built", "I run", contractions welcome.
- **Say it once.** A fact (years of experience, a tech stack, a product count) lives in one
  place on the page. If a chip, badge or marquee already shows it, the prose doesn't repeat it.

## Structure per project

1. Tagline: one line, what it is or why it exists. No trailing period needed.
2. Blurb: 2–3 sentences. The problem or idea, what makes it different, one detail that
   makes it memorable. Don't list every feature.
3. Stack chips carry the tech. Don't repeat the stack in the blurb.

## Avoid

- Filler and hype: leverage, seamless, robust, cutting-edge, passionate, innovative,
  elevate, unlock, empower, revolutionize, game-changer, dive in, journey, world-class.
- AI-writing tells: "not just X, it's Y", "No A. No B. Just C.", a question answered by the
  next sentence, sentences starting "Whether you're", stacks of em dashes, exclamation marks.
- Reflexive triplets. Two items or an honest longer list reads more human than "fast,
  simple, and powerful".
- Claims that can't be checked (user counts, "loved by", percentages) unless Adrian gave them.
- SetupSignal rules: always "simulated"/"paper", never "signals" as a noun, never
  imply returns, keep the not-financial-advice note.

## Linter

Run before committing copy changes:

```bash
python3 .claude/skills/portfolio-copy/lint_copy.py index.html
```

It prints warnings for banned words, AI-writing patterns, long sentences, triplets and
repeated phrases across the page. Fix or consciously accept each one; it exits non-zero
when it finds errors (banned words, em dashes, exclamation marks).
