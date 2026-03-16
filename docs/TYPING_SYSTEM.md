# Typing System Notes

This document explains the on-screen typing model and tuning strategy.

## Interaction Model

- Mouth open: move highlight to next key
- Smile: select highlighted key
- Double blink: backspace

## Keyboard Improvements

- Added punctuation keys: `,`, `.`, `?`, `'`
- Added `SHIFT` toggle key
- Smart punctuation insertion trims trailing spaces and appends punctuation with spacing
- Enter key inserts newline after trimming trailing spaces

## Cooldown Controls

Three cooldowns reduce accidental repeated actions:

- `mouthTypingAdvanceCooldownMs`
- `mouthTypingSelectCooldownMs`
- `mouthTypingBackspaceCooldownMs`

These are configurable in Settings and persisted per profile.

## Tuning Heuristics

- If key focus advances too quickly: increase advance cooldown
- If key selection duplicates: increase select cooldown
- If corrections feel too slow: lower backspace cooldown gradually

## Future Ideas

- Word prediction strip
- Row/column scan mode
- Per-user adaptive cooldown tuning
- Language packs and custom key layouts
