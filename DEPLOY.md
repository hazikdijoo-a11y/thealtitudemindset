# Deploying this site

This folder is a **complete drop-in replacement** for the
`hazikdijoo-a11y/thealtitudemindset` repository. Every existing file has been
carried over, so nothing that currently works will break.

## What to upload

Copy the entire contents of this folder into the repo root, overwriting when
prompted. GitHub Pages rebuilds automatically in a minute or two.

- **Replaced:** `index.html`, `sitemap.xml`
- **New:** `robots.txt`, `assets/`, and the six page folders
  (`about/`, `coaching/`, `framework/`, `cabin-crew-training/`,
  `resources/`, `blog/`)
- **Untouched:** all `blog-*.html` posts, `privacy.html`, `terms.html`,
  `tracker.html`, `404.html`, `CNAME`, the Google verification file, and
  the original images (old posts still reference them)

## Editing later

Header and footer markup is repeated in each page file rather than pulled from
a template. That is deliberate: GitHub Pages serves these files as-is, so you
can edit any page straight in the GitHub web UI with no build step. If you
change a nav link, change it in all seven pages.

All styling lives in `assets/css/site.css` and all behaviour in
`assets/js/site.js` — edit once, applies everywhere.

## Turning on analytics

Open `assets/js/site.js` and fill in the CONFIG block at the top. Both fields
ship empty on purpose; until you add a real ID, the tracking calls do nothing.
Cloudflare Web Analytics keeps recording pageviews regardless.

Every CTA already carries a `data-track` name:
`discovery_call_click`, `whatsapp_click`, `email_click`, `lead_magnet_click`,
`lead_magnet_submit`, `contact_form_submit`, `cabin_crew_click`,
`cabin_crew_enquiry`, `instagram_click`, `linkedin_click`, `youtube_click`,
`twitter_click`.

## Turning on testimonials

`index.html` contains a commented-out testimonial section with a
Before / The Shift / After structure. Delete the comment markers around it and
replace the bracketed placeholders with a real client's words. Nothing is
published until you do — no invented testimonials ship with this site.
