# Aunt Prunelda's Inheritance

This repository packages the original Atari disk image for Aunt Prunelda's Inheritance as a playable browser experience hosted from `/prunelda/` on jamesonmacarthur.com.

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

- The browser player lives in `public/emulator/` and is adapted from the jsA8E packaging used by the AtariOnline project.
- The original source disk image from the workspace root is copied into `public/emulator/data/prunelda.atr` for deployment.
- The site shell in `src/` wraps the emulator with responsive layout, restart affordance, and a full-player link.

## Attribution

- jsA8E emulator: Sascha Springer.
- Browser packaging inspiration and asset layout adapted from `eahumada/AtariOnline`.

## Deployment

GitHub Actions deploys the built `dist/` directory to cPanel over FTP using the same pattern as Nightcrossing.

Required GitHub repository secrets:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`