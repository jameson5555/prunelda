# Aunt Prunelda's Inheritance

This repository now ships a browser-native remake of Aunt Prunelda's Inheritance for hosting from `/prunelda/` on jamesonmacarthur.com.

## Development

Install dependencies and run the local app:

```bash
npm install
npm run dev
```

Build the production site:

```bash
npm run build
```

The Vite config uses `base: '/prunelda/'` so the build output works when deployed to a subfolder rather than the domain root.

## Implementation notes

- The playable app lives in `src/` as a Vite-powered vanilla JavaScript game.
- The remake uses text, business names, prompts, and flow extracted from the original Atari release.
- Browser save/continue uses `localStorage`.

## Attribution

- Original game concept, text, and business data derived from Jack Eastman's Atari release.

## Deployment

GitHub Actions deploys the built `dist/` directory to cPanel over FTP using the same pattern as Nightcrossing.

Required GitHub repository secrets:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`