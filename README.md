
# Cathedral Guesser

A simple web app that shows a photo of a cathedral and asks you to guess which one it is.

## How to play
- Open the site. A random cathedral image appears.
- Type your guess in the box and press Enter or click Submit.
- If your guess matches (the app ignores common words like "cathedral" or "st"), you get a "Correct" message and the next cathedral appears.
-- Use "Hint" to show a short hint about the cathedral (the app picks one randomly from a per-cathedral list), or "Reveal" to show the full name and move to the next image after the configured delay.

## Why this exists
To practise knowledge and recognition of cathedrals

Local Quick start (for users)
1. Run the app locally:
```bash
npm install
npm run dev
```
2. Visit http://localhost:3000

## Contributing
Want to contribute or run the project? See `CONTRIBUTING.md` for developer notes and setup steps. Hints are stored in `data/hints-mapping.json` — edit that file to add or update per-cathedral hints.