# Developer & Agent Guide: DevFest Berlin 2026 Website

This guide provides instructions for future human contributors and AI agents working on this codebase.

---

## 1. Architecture & Tech Stack

- **Static Site Generator**: [Eleventy 3.x](https://11ty.dev/) (ESM module setup).
- **CSS Bundler**: [esbuild](https://esbuild.github.io/) triggered via `eleventy.before` hook in [`eleventy.config.js`](eleventy.config.js).
- **Templating**: [Nunjucks](https://mozilla.github.io/nunjucks/) (`.njk`) with native support for Markdown (`.md`).
- **Design System**: Adapted from [Ghost Casper](https://github.com/TryGhost/Casper) theme with clean responsive mobile tuning.
- **CI / CD**: GitHub Actions in [`.github/workflows/`](.github/workflows/) deploying to GitHub Pages on pushes to `main`.

---

## 2. Directory Structure & Key Files

```
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # PR / push build verification
│   │   └── deploy.yml           # Automated deployment to GitHub Pages
│   └── dependabot.yml           # Weekly dependency update checks
├── src/
│   ├── _data/
│   │   └── site.json            # Central config: metadata, nav, links, organizers, newsletter
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk         # Outer wrapper: head, Casper navbar, burger menu, footer
│   │   │   └── page.njk         # Generic layout for standalone pages (Agenda, Venue, FAQ, etc.)
│   │   └── partials/
│   │       └── sponsor-wall.njk # Sponsor logo wall, shared by the home page and /sponsors/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── casper.css       # Core Ghost Casper stylesheet
│   │   │   ├── custom.css       # DevFest-specific styling, form tuning, mobile reflow
│   │   │   └── screen.css       # Entry point for esbuild (imports casper.css + custom.css)
│   │   ├── js/
│   │   │   └── main.js          # Mobile burger drawer & URL-encoded AJAX newsletter submit
│   │   └── images/
│   │       └── devfest-cover.svg # Hero background vector banner
│   ├── favicon.svg              # DevFest-style code brackets favicon
│   ├── index.njk                # Home page template
│   └── sponsors.njk             # /sponsors/ page
├── eleventy.config.js           # 11ty 3 configuration and esbuild CSS build script
├── package.json
└── README.md
```

---

## 3. How to Add New Content & Pages

### Option A: Standalone Page (Markdown or Nunjucks)
To add a new page (e.g., `/agenda/`, `/venue/`, `/faq/`, `/tickets/`):

1. Create a file in `src/` (e.g. `src/agenda.md` or `src/agenda.njk`).
2. Use frontmatter pointing to `page.njk`:
   ```markdown
   ---
   layout: page.njk
   title: "Conference Agenda"
   description: "Explore talks, workshops, and keynotes at DevFest Berlin 2026."
   permalink: /agenda/
   ---

   Your content or embedded widgets go here...
   ```
3. Add a link in [`src/_data/site.json`](src/_data/site.json) under `"navigation"` or `"footerNavigation"`:
   ```json
   { "label": "Agenda", "url": "/agenda/" }
   ```

### Option B: Embedding Sessionize for the Agenda
When Sessionize is set up for DevFest Berlin 2026:
- Drop the Sessionize script/iframe directly into `src/agenda.njk` or as a section on `src/index.njk`:
  ```html
  <div id="sessionize-wrapper" class="outer">
    <div class="inner">
      <script type="text/javascript" src="https://sessionize.com/api/v2/YOUR_ID/view/GridSmart"></script>
    </div>
  </div>
  ```

### Option C: Adding Ticket Sales (Eventbrite / Tito / Pretix)
- Add a primary CTA button in `src/_includes/layouts/base.njk` inside `.gh-head-actions`:
  ```html
  <a class="gh-head-button" href="https://your-ticketing-link" target="_blank" rel="noopener">Get Tickets</a>
  ```
- Or place an embedded ticketing widget in a new `src/tickets.njk` page using `layout: page.njk`.


#### Search and sharing metadata
`base.njk` builds the canonical link from `site.url`, sets the theme colour from `site.accentColor`, and adds Event structured data on the home page from `site.eventDate`, `site.venue` and `site.organizerName`. `sitemap.xml` lists every page in `collections.all` and `robots.txt` points to it, so a new page appears in the sitemap without extra work. If the canonical domain changes, update `site.url` only.

### Opening the CFP or ticket sales (no template edits)
`site.json` carries a `cfp` and a `tickets` block. Each starts at `"status": "soon"`, which renders nothing new.
- **CFP opens:** set `cfp.status` to `"open"`, `cfp.url` to the submission page and optionally `cfp.deadline` (for example `"October 18, 2026"`). A "Call for Speakers" menu link, a "Submit a Talk" header and hero button, and an "open until" line appear.
- **CFP closes:** set `cfp.status` to `"closed"`. The buttons disappear and the hero shows a thank-you line.
- **Tickets on sale** (for example the Bevy page): set `tickets.status` to `"open"` and `tickets.url`. "Get Tickets" takes over the header button and leads the hero buttons.
A block only switches on when its `url` is set, so a half-filled change cannot publish a dead button.


### Sponsors
The home page's sponsors band and `/sponsors/` read `sponsorship` (pitch, stats, what we need, contact email) and `sponsors` in `site.json`. The logo wall appears only once `sponsors` has entries. To add one, append `{ "name": "…", "url": "https://…", "logo": "/assets/images/sponsors/<name>.svg", "role": "Venue partner" }` and put the logo file in `src/assets/images/sponsors/`. `logo` and `role` are optional; without a logo the name shows as text. Keep prices out of the site; they belong in the sponsorship deck.

### Option D: Adding an FAQ Accordion
- Add an FAQ section to `src/index.njk` or a dedicated `src/faq.md`.
- HTML `<details>` and `<summary>` elements work out of the box with zero JavaScript and look clean in Casper's `.gh-content` container.

---

## 4. Styling & Mobile Reflow Rules

- **Do NOT edit `casper.css` directly**: Put all new styles, component rules, and overrides in [`src/assets/css/custom.css`](src/assets/css/custom.css).
- **CSS Build**: [`src/assets/css/screen.css`](src/assets/css/screen.css) imports `casper.css` followed by `custom.css`. `esbuild` automatically bundles and minifies this into `_site/assets/css/screen.css` on every build/reload.
- **Breakpoints**:
  - Desktop ($\ge 900\text{px}$): 3-column organizer grid (`repeat(3, 1fr)`).
  - Tablet & Mobile ($< 900\text{px}$): Clean single column (`1fr`) reflow (avoids awkward 2+1 wrapping states).
  - Small Mobile ($\le 560\text{px}$): Stacked full-width subscription input and button.
- **Dark Mode**: Casper styles use `html.auto-color` and automatically adapt via `@media (prefers-color-scheme: dark)`.

---

## 5. Email Subscription / Google Forms Endpoint

- The form in `src/index.njk` submits to the URL configured in `site.json` (`newsletter.action`).
- **Google Forms Submission**:
  - The script in [`src/assets/js/main.js`](src/assets/js/main.js) converts `FormData` to `URLSearchParams` and posts as `application/x-www-form-urlencoded` with `mode: 'no-cors'`.
  - Google Forms **requires** the exact input name `entry.XXXXXXX` (not `email`), otherwise responses will be recorded as empty rows.
  - Current configured input field: `"entry.464015783"`.
- If migrating to another provider (e.g. Formspree, Mailchimp, Buttondown): simply update `site.json` with the new endpoint URL and field name.

---

## 6. Development Workflow

```bash
# Start local server with hot reloading
npm run dev

# Build production static site
npm run build
```
Builds take under 100ms. All assets and pages are compiled into `_site/`.
