# Contributing to Cathedral Guesser

Thanks for your interest in contributing! This document explains how to report issues, propose features, and navigate the codebase so you can make effective contributions.


## Getting help
- If you find a bug, typo, or want a new feature, open an Issue on GitHub with a clear title and reproduction steps or desired outcome.
- If you want to submit code changes, open a Pull Request describing the change and referencing any related issues.

## Repository layout overview
- `app/layout.tsx` — site chrome and top navigation. Keep changes minimal here; prefer styles in `app/globals.css`.
- `app/page.tsx` — the main client-side UI and logic. This is where guessing logic, counters, hint/reveal behavior, and most UI lives.
- `app/api/cathedrals/route.ts` — server route that discovers images and returns JSON, including per-image credits from the attribution manifest.
- `app/components/RevealSlider.tsx` — small client component for the reveal delay slider.
- `app/globals.css` — the global stylesheet. Styles are intentionally compact and designed for clarity over complexity.
- `public/images/cathedrals/` — image assets. See the "Images and regions" section below for guidance.
- `data/photo-attributions.json` — source file page, creator, license, and attribution for sourced photos. Add an entry for each sourced image using its path relative to `public/images/cathedrals/`.
- `data/` — hardcoded per-cathedral hints mapping (`data/hints-mapping.json`).

## Design decisions and conventions
- Simple file-first approach: images live in `public` and are discovered at runtime by the server route for simplicity and easy deployment.
- Minimal dependencies: the project prefers plain CSS and small client-side code to keep the app lightweight and easy to reason about.
- Matching rules: guesses are matched by significant words to tolerate variations (e.g., "St Paul" vs "Saint Paul's"). Stopwords such as "cathedral", "st", and "anglican" are ignored.

## How to make a contribution
1. Fork the repository and create a feature branch (e.g. `feature/add-localstorage-stats`).
2. Run the project locally and verify changes:
```bash
npm install
npm run dev
```
3. Make small, focused commits with clear messages. Rebase or merge main to keep your branch up to date.
4. Open a Pull Request describing the change, linking to any related Issue, and include screenshots or reproduction steps for UI changes.

## Local development and technical details
These notes are for contributors who want to run or modify the project.

### Images, hints, and photo credits

```json
{
  "Canterbury Cathedral": ["South East", "Home of the Archbishop of Canterbury"]
}
```

When adding a photo from an external source, first verify its reuse license on the source's file page. Record every sourced file in `data/photo-attributions.json`, keyed by its path relative to `public/images/cathedrals/`:

```json
{
  "schemaVersion": 1,
  "photos": {
    "Canterbury Cathedral/commons-123456.jpg": {
      "originalFilePage": "https://commons.wikimedia.org/wiki/File:Example.jpg",
      "creator": "Photographer name",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "attributionText": "Photo by Photographer name, licensed CC BY-SA 4.0."
    }
  }
}
```

The quiz shows these credits with the current photo. Keep the source file page, creator, license, and credit text accurate if an image is resized or otherwise adapted.


### Adding a new cathedral
1. Create a folder for the cathedral under `public/images/cathedrals/`. Example:
  - `public/images/cathedrals/Canterbury Cathedral/`
2. Add one or more image files into that folder (jpg/png/webp).
3. Open `data/hints-mapping.json` and add an entry keyed by the folder name, e.g.:
```json
"Canterbury Cathedral": ["South East", "Home of the Archbishop of Canterbury"]
```
4. Start the dev server and verify the new cathedral appears and that `Hint` displays one of the configured hints.

If you prefer to physically group by region, you may place the folder under `public/images/cathedrals/<Region>/`, but supplying explicit hints in `data/hints-mapping.json` is the recommended approach so you can provide multiple hints per cathedral.

### Notes on automation
This repository does not include generator or restructure scripts. Edit `data/hints-mapping.json` directly to add or update hints. If you want automated tools for generating templates or bulk-moving folders, create local scripts or open an Issue requesting a safe utility (for example, a `--dry-run` or `--copy` mode) and include your preferred behavior.

### API and developer testing
- The server route `GET /api/cathedrals` returns JSON objects with `hints`, `folder`, an `images` URL array, and an aligned `imageCredits` array (`null` for images without manifest entries).
- To inspect API output locally:
```bash
curl -sS http://localhost:3000/api/cathedrals | jq '.[] | {folder,images,imageCredits,hints}'
```

### Guess matching and UI
- Matching ignores stopwords and compares significant words.
- Reveal delay is read from `localStorage` (`revealDelaySeconds`) and the `Reveal` action will advance after that many seconds.
- Hints: each cathedral may have one or more hints. When a user presses `Hint` the app randomly selects one of the configured hints for that cathedral and displays it for 3 seconds. If no hints are configured, the app displays `No hint available`.

### Safety and workflow
If you want a safer copy-first workflow for bulk reorganization of images, open an Issue requesting a utility (for example, a tool with `--dry-run` or `--copy` modes).

## Style and accessibility guidance
- Use `font-family: inherit` for inputs and components so theming remains consistent.
- Keep color contrast accessible for status labels and counters.

## Reporting issues and feature requests
- Use GitHub Issues. Provide:
  - A descriptive title
  - Steps to reproduce or expected behavior
  - Environment / Node version (if relevant)
  - Screenshots for UI bugs

## Branching and commits
- Prefer short-lived feature branches.
- Use semantic commit messages where helpful.

## Code review checklist
- Does the change add or update tests where relevant?
- Are UI changes accessible (contrast, focus states)?
- Is the change small and focused, or does it need to be broken into multiple PRs?

Thank you for helping improve Cathedral Guesser — contributions of any size are welcome.
