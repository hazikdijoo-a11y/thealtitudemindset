# The Altitude Mindset — Website Audit

**Date:** 2026-09-17
**Live site:** https://thealtitudemindset.com
**Scope:** thealtitudemindset.com (the coaching site). `shiftreset.in` and the
Altitude backend are separate products audited elsewhere.

---

## 1. Executive Summary

The site is a **static HTML/CSS/JS site** (no framework, no build step, no
`package.json`) deployed to GitHub Pages via `git push`. There are 21 pages,
sharing one design system (`assets/css/site.css`) and one behaviour script
(`assets/js/site.js`).

The core funnel — hero → problem → framework → outcomes → founder story →
credentials → offer → journey → lead magnet → Instagram start-here → blog →
FAQ → final CTA → contact — **already exists and is coherent**. This is not a
brand-new build; it's a mature site that has had several rounds of real audit
work (contrast fixes, refund/legal pages, payment integration, a full
portfolio rebuild). Most of the classic P0 technical bugs this kind of audit
usually finds — layout overflow, broken structured data, missing focus
states, dead links — were already caught and fixed in recent passes and are
noted as resolved below rather than re-flagged.

What's genuinely missing is **one interactive section the brief specifically
asked for** (a self-identification pattern-selector), **working analytics**
(the tracking code exists everywhere but is wired to nothing), and **the
written funnel assets** (email nurture sequence, event taxonomy) that were
never documented.

**This audit does not recommend a framework migration.** The brief's
technical-audit checklist (package.json, Tailwind config, component
architecture) assumes a JS framework. Introducing one here would mean
rewriting a working, fast, zero-dependency site for no functional gain —
exactly what section 55 of the brief says not to do ("do not replace a
working integration simply because you prefer another technology"). The
"component system" equivalent that already exists is the shared CSS class
system (`.btn`, `.card`, `.tier`, `.faq`, `.post`, etc.) — documented in
Section 3 below.

---

## 2. Current Architecture

- **Stack:** Plain HTML5 + CSS + vanilla JS. No React/Next/Vite/Tailwind.
- **Pages (21):** `index.html`, `about/`, `coaching/`, `framework/`,
  `cabin-crew-training/`, `resources/`, `blog/` + 12 individual posts,
  `portfolio/`, plus `privacy.html`, `terms.html`, `refund.html`,
  `delivery.html`, `contact.html`, `tracker.html`, `404.html`.
- **Shared design system:** `assets/css/site.css` (734 lines) — CSS custom
  properties for color/type/space, then component classes.
- **Shared behaviour:** `assets/js/site.js` (346 lines) — nav drawer, smooth
  anchor scroll, form submission (Formspree + a fire-and-forget copy to the
  Altitude backend), "Pay for a session" reveal logic, scroll-reveal
  animation, an analytics dispatcher that currently has nowhere to send data
  (see §16).
- **No templating.** Header/nav/footer are copy-pasted into every page
  (documented in the repo's own `DEPLOY.md`). This is a known, accepted
  tradeoff for a site this size — a templating layer would be the single
  biggest architecture change worth considering if the page count keeps
  growing, but is out of scope for this audit.
- **Deploy:** `git push` to `main` → GitHub Pages rebuilds automatically.
  Custom domain via `CNAME`.
- **Backend integrations:** Formspree (primary lead capture), a Node/Postgres
  backend on Netlify (`altitude-api`) that mirrors every lead and now runs
  live Razorpay payments, Calendly (discovery calls), Cloudflare Web
  Analytics (pageviews only, no events).

---

## 3. UX Audit

**Working well:**
- The funnel order matches the brief's own recommended structure almost
  exactly: hero → problem → framework → outcomes → founder credibility →
  offer → journey → lead magnet → Instagram fast-path → blog → separate
  cabin-crew banner → FAQ → objection-handling ("where coaching isn't the
  right tool") → final CTA → contact.
- The Instagram fast-path section (§20 of the brief) **already exists**:
  "Came from Instagram? Start here" with a 5-step numbered path (story →
  approach → framework → writing → book a call). This was a real ask in the
  brief and doesn't need building.
- Cabin Crew Training is already structurally separated (§24): its own page,
  its own nav item, and on the homepage it appears as a single low-emphasis
  banner ("Separate offering") below the main funnel, not woven into it.
- The offer section already matches the brief's exact recommended structure
  (§15): free discovery call card + paid session card, side by side, with
  the free tier visually primary (gold border) and the refund guarantee
  directly underneath.

**Gaps:**
- **No self-identification component (§9 of the brief).** The "Where it
  usually shows up" list exists but is a static bullet list, not an
  interactive one. This is the one structurally new thing the brief asks for
  that doesn't exist yet. **Implemented in this pass — see §14.**
- **CTA label consistency:** "Book a Free Call" / "Book Your Free Discovery
  Call" / "Book a free discovery call" are all used for the same action
  across different pages and states (nav, hero, mobile bar, footer). This is
  a minor voice inconsistency, not a functional one — every version is
  honest and specific — but worth standardizing. **P2, not fixed this pass**
  (low risk, but touches copy on every page — flagging for your sign-off
  rather than mass-editing silently).

---

## 4. UI Audit

- Visual system is restrained and consistent: navy `#0B1B33` / gold `#E8C468`,
  DM Serif Display for display type, Inter for everything else. This matches
  the brief's explicit instruction to avoid "generic SaaS," "excessive
  gradients," "generic glassmorphism" — the existing system already clears
  that bar.
- Cards, buttons, and section bands are reused consistently via the CSS
  component classes rather than one-off styles.
- Scroll-reveal animation is subtle (fade + 14px rise), respects
  `prefers-reduced-motion`, and has a failsafe: if the `IntersectionObserver`
  hasn't revealed anything within 2.5s, it force-reveals everything rather
  than risk permanently invisible content. This is a mature, defensive
  implementation — no changes needed.
- **Resolved earlier this week, noted here for the record:** hero stat labels
  running into their numbers, section headings wrapping onto three lines at
  desktop width, the final-CTA panel's decorative line cutting through its
  own heading, CTA buttons overflowing their panel at 320px, and the cabin
  crew section using an `h3` where an `h2` belonged.

---

## 5. Conversion Audit

Mapped against the brief's funnel (Visitor → Recognition → Trust → Curiosity
→ Clarity → Low-risk action → Discovery call → Paid coaching):

| Stage | Present? | Where |
|---|---|---|
| Recognition | ✅ | "You know you're capable of more" + pattern list |
| Trust | ✅ | Aviation credibility section, credentials, "10+ years" trust strip |
| Curiosity | ✅ | Framework section (5 stages) |
| Clarity | ✅ | Outcomes section, FAQ, offer structure |
| Low-risk action | ✅ | Free discovery call is visually primary everywhere |
| Discovery call | ✅ | Calendly link, tracked via `data-track="discovery_call_click"` |
| Paid coaching | ✅ | Clear ₹3,500/session, no-package framing |

**The funnel is structurally complete.** The primary conversion gap is not
missing sections — it's that **none of it is measured** (§16) and one
requested engagement mechanism (§9) was missing until this pass.

---

## 6. Copy Audit

Spot-checked against the brief's banned phrases ("unlock your potential,"
"become your best self," "transform your life," "manifest," "reach new
heights," generic guru language): **none of these appear anywhere on the
site.** The existing copy already follows the brief's own rules — specific,
observable language ("Confidence that doesn't depend on the room going
well," "The rough phase forces the growth") rather than hype. This is a real
strength worth explicitly preserving, not rewriting.

The brief also asks for a broader "conversion copy" pass across every
section. That is a **content/positioning decision**, not a bug fix — per
the brief's own §55 ("when a decision could materially change the business
positioning, explain before implementing"), I have not rewritten homepage
copy in this pass. If you want a line-by-line copy pass, that's a good next
engagement, done with you reviewing before/after rather than shipped silently.

---

## 7. Mobile Audit

Tested at 320 / 360 / 390 / 768 / 1024 / 1280 / 1440px on the homepage and
every top-level page this week. **Zero horizontal overflow found** at any
width after the fixes already applied. Sticky mobile CTA bar exists
(`.mobilebar`, "Book Your Free Discovery Call" + a WhatsApp icon), doesn't
cover form fields, and is hidden above 880px.

---

## 8. SEO Audit

- Every top-level page has a unique `<title>`, meta description, and
  canonical URL. Good baseline.
- Structured data: `WebSite`, `Person`, `ProfessionalService`, two `Service`
  nodes, and `FAQPage` on the homepage — all valid JSON-LD, and the FAQ data
  now matches the visible FAQ verbatim (fixed this week; it previously had
  three mismatched questions).
- `robots.txt` is minimal and correct (`Allow: /` + sitemap pointer).
  `sitemap.xml` is current (24 URLs, includes the portfolio and every blog
  post).
- **Gap: no `og:image:width`/`og:image:height` on any page.** Minor, but
  some link-unfurl services fall back to a low-quality preview without
  explicit dimensions. **Fixed in this pass — see §14.**
- No keyword stuffing anywhere — copy reads as human throughout.

---

## 9. Accessibility Audit

- Semantic structure is solid: one `h1` per page, logical heading order,
  `<nav aria-label="Primary">`, skip link present.
- Focus states: visible 3px outline on every interactive element, switched
  to gold on dark backgrounds — confirmed across nav, buttons, form fields,
  and (as of this week) every blog post link.
- Contrast: the site's own AA pass replaced the original `#9B968C` grey
  (fails AA) with `#6E6A62` (passes) across every page that used it.
- Forms: every input has a real `<label>`, not placeholder-as-label.
- `prefers-reduced-motion` is respected globally (animations drop to 0.001ms,
  scroll-behavior goes to `auto`).

No accessibility P0s found. This site is in noticeably better shape here
than most small-business sites of this size.

---

## 10. Performance Audit

- Homepage HTML: 58.6 KB, loads in ~0.3s from India-adjacent infra (GitHub
  Pages CDN).
- No JS framework, no bundler overhead, one deferred script
  (`site.js`, 346 lines, ~11 KB uncompressed).
- Fonts: Google Fonts (`DM Serif Display`, `Inter`), `preconnect` hints
  present.
- Images: hero portrait ships as two sizes via `srcset`
  (520w/840w) with `fetchpriority="high"`; below-the-fold images use
  `loading="lazy"`. This is already correct responsive-image practice.
- **Gap: four large, unreferenced images sit in the repo root** —
  `HAZIK.png` (1.9 MB), `mirror_post_autopilot.png` (1.6 MB), `nlp-badge.png`
  (83 KB), `certificate-hazik.jpg` (323 KB). None of these load on any live
  page (confirmed: zero HTML references to any of them), so **they cost
  nothing for visitors** — this is pure repo hygiene, not a live-site
  performance issue. **Removed in this pass — see §14.**

---

## 11. Technical Audit

- No `package.json`, no framework — see §2. Nothing here to migrate.
- No exposed secrets in any client-side file (checked `site.js` and every
  page for API keys, tokens, credentials — the backend correctly keeps its
  Razorpay key secret server-side; the browser only ever sees a public key
  ID at checkout time).
- Forms have loading state (button text → "Sending…", disabled), success
  state (button → "Sent ✓" + confirmation text), and error state (button
  re-enabled, error message with a fallback email address) — all three
  states the brief asks for in §44/§45 are already implemented in
  `wireForm()` in `site.js`.
- The project-intake form on the portfolio page additionally has inline
  per-field validation (added in an earlier pass this month).

---

## 12. Trust & Credibility Audit

Matches the brief's requested trust sequence (§38) closely: positioning →
recognizable problem → the aviation/NLP differentiation story → framework →
credentials → offer → low-risk first step → ethics boundary (the "where
coaching isn't the right tool" section, which explicitly lists when to seek
licensed mental-health care instead) → CTA. Credentials shown are all
real and verifiable from the site's own copy (NLP Practitioner &amp; Life
Coach via Auspicium/Transformation Academy, Line Check Cabin Crew Evaluator,
Viinzs Airhostess Training Academy faculty, SpiceJet 10-year service award) —
nothing fabricated, no invented numbers or claims.

---

## 13. Lead Generation Audit

- **Discovery call:** Calendly link, `data-track="discovery_call_click"`
  already on every instance of the button. Booking confirmation happens on
  Calendly's own page — this site cannot know if a call was actually booked
  (no Calendly webhook is wired up), so `discovery_call_booked` **cannot be
  claimed as tracked** without adding that webhook. Documented as a gap in
  `ANALYTICS.md`, not implemented here (needs a decision from you: is it
  worth wiring a Calendly webhook into the backend for this?).
- **Lead magnet:** "7 Patterns That Keep High Performers Stuck" — form has
  first name + email only (matches the brief's "avoid unnecessary fields"
  rule), delivers the PDF instantly on success via `data-deliver`, and also
  copies the lead into the Altitude backend dashboard. No email automation
  exists beyond that single instant delivery — see `MARKETING_FUNNEL.md` for
  a proposed 5-email sequence, not yet built (needs an email provider
  decision from you — Formspree doesn't do sequences).
- **Contact form:** same dual-write pattern, interest dropdown, honeypot
  spam field.

---

## 14. Changes Made In This Pass

These were implemented directly because they're additive, low-risk, and
don't touch business positioning or copy meaning:

1. **Built the self-identification section (brief §9).** The existing
   "Where it usually shows up" list is now interactive: each item is a
   toggleable pill (not a form, no data collected or submitted anywhere —
   matches the brief's explicit instruction not to collect sensitive
   mental-health data). Selecting any item reveals a CTA: "See how coaching
   could help" → discovery call. All copy reused verbatim from the existing
   list; nothing invented.
2. **Added `og:image:width` / `og:image:height`** to every page that has an
   `og:image` tag, using each image's real dimensions.
3. **Removed four dead, unreferenced images** from the repo root
   (`HAZIK.png`, `mirror_post_autopilot.png`, `nlp-badge.png`,
   `certificate-hazik.jpg` — ~3.9 MB total). Verified zero references first.

## 15. Priority Matrix (Remaining)

| # | Finding | Priority | Status |
|---|---|---|---|
| 1 | Analytics events wired to nothing (no GA4/Meta Pixel ID) | **P0** | Needs your decision — see `ANALYTICS.md` |
| 2 | Self-identification section missing | P1 | ✅ Fixed this pass |
| 3 | No email nurture sequence for the lead magnet | P1 | Copy written — see `MARKETING_FUNNEL.md`; needs an email provider to implement |
| 4 | `discovery_call_booked` not actually trackable | P1 | Documented; needs a Calendly-webhook decision |
| 5 | Missing `og:image` dimensions | P2 | ✅ Fixed this pass |
| 6 | Dead unreferenced images in repo | P2 | ✅ Fixed this pass |
| 7 | CTA label wording varies slightly across pages | P2 | Flagged, not changed — copy decision |
| 8 | No templating layer (7-page nav duplication) | P3 | Known tradeoff, not a bug |
| 9 | No genuine testimonials yet | P3 | Correctly left empty per your own earlier instruction — do not fabricate |

**Nothing found in this audit blocks a visitor from booking a call today.**
The single highest-leverage next step is #1: analytics. Right now every
`data-track` event on the site — button clicks, form submits, WhatsApp
clicks — fires into a function that checks for a GA4/Meta ID, finds none,
and does nothing. The wiring is correct and ready; it just has nowhere to
send data.
