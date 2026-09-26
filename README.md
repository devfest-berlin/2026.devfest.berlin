# DevFest Berlin 2026 Website

DevFest Berlin 2026 website built with [Eleventy 3.x](https://11ty.dev/) and styled with the [Ghost Casper](https://github.com/TryGhost/Casper) theme design.

- **Date**: Saturday, November 14, 2026
- **Venue**: SRH Berlin University of Applied Sciences, Berlin, Germany

## Features

- **Casper Aesthetic**: Hero cover header, clean typography, responsive layout, and automatic dark mode support.
- **Fast Build Pipeline**: Eleventy 3 (ESM) + `esbuild` for instant CSS bundling and minification (< 100ms).
- **Zero-Backend Email Subscription**: Configured with Google Forms to collect emails directly into Google Sheets with zero server secrets.
- **Mobile-Tuned Reflow**: Desktop 3-column organizer grid reflowing cleanly to single-column on tablet and mobile, with touch-friendly form controls.
- **Central Data Cascade**: All navigation, metadata, and 7 local GDG/community organizers defined in [`src/_data/site.json`](src/_data/site.json).
- **CI / CD Ready**: GitHub Actions for PR build verification and automatic deployment to GitHub Pages on `main`.

## Development

```bash
# Install dependencies
npm install

# Start local development server with hot-reload (http://localhost:8080)
npm run dev

# Build for production (outputs to _site/)
npm run build
```

## Adding Pages & Expanding the Site

See [**AGENTS.md**](AGENTS.md) for detailed guidelines on:
- Creating standalone pages for **Agenda**, **Venue**, **Ticketing**, and **FAQ** using [`src/_includes/layouts/page.njk`](src/_includes/layouts/page.njk).
- Embedding **Sessionize** for the speaker schedule.
- Connecting ticket sales widgets.
- Casper layout structure, CSS rules, and breakpoints.
