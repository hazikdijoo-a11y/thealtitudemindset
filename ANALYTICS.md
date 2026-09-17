# Analytics

## Current state

The site has three analytics layers:

1. **Cloudflare Web Analytics** — already live on every page (the `<script
   data-cf-beacon>` tag). Cookie-free pageview counts only. This works today
   with no action needed.
2. **A custom event dispatcher in `assets/js/site.js`** (function `track()`).
   Every element with a `data-track="event_name"` attribute fires this on
   click; forms fire it on successful submit via `data-track-submit`. This
   is wired correctly across the whole site — **but it is currently a no-op**,
   because both destination IDs in `CONFIG` are empty:
   ```js
   ga4MeasurementId: '',   // empty = disabled
   metaPixelId: '',        // empty = disabled
   ```
   Until one of these is filled in, every click is counted by nobody.
3. **The Altitude backend admin dashboard** — records every lead
   (contact + free-guide submissions) with source page and interest, but
   this is a lead log, not a general event tracker.

## Event taxonomy (already implemented, just needs a destination)

These `data-track` values already exist in the HTML across the site:

| Event | Fires on | Found on |
|---|---|---|
| `discovery_call_click` | Any "book a free call" link/button | Nav, hero, mobile bar, offer section, Instagram start-here, final CTA, footer, cabin crew page |
| `hero_start_project` / `hero_explore_work` | Portfolio hero CTAs | Portfolio page |
| `cabin_crew_click` | Link to the cabin crew page | Homepage banner |
| `cabin_crew_enquiry` | WhatsApp enquiry button | Cabin crew page |
| `pay_click` | "Pay for a session" reveal links | Coaching, homepage, cabin crew |
| `contact_form_submit` | Contact form success | Homepage `#contact` |
| `project_form_submit` | Project intake form success | Portfolio |
| `case_study_open` / `case_study_view` / `case_study_start` | Portfolio case-study panel | Portfolio |
| `portfolio_filter` | Project filter buttons | Portfolio |
| `instagram_click` / `linkedin_click` / `youtube_click` / `twitter_click` / `email_click` | Social links | Footer, everywhere |
| `nav_start_project` | Nav "Start a Project" | Portfolio |

Two events the brief asks for do **not** exist yet because the underlying
markup they'd attach to isn't built the same way — see below:

- **`page_view`** — not needed as a custom event; Cloudflare and GA4 both
  auto-track pageviews natively once GA4 is connected.
- **`framework_cta_click`** — the "Explore the Framework" links don't
  currently carry a `data-track` attribute. Trivial to add once you confirm
  you want GA4 wired up (no reason to add tracking attributes for a
  destination that doesn't exist yet).
- **`free_guide_view`** — would need to fire when the lead-magnet section
  scrolls into view (an intersection observer), not just on submit. Doable,
  low priority until GA4 exists.
- **`free_guide_submit`** — the form already fires `form_submit`-style
  tracking via `data-track-submit`; confirm you want it renamed to match
  this exact name once wired.
- **`pricing_view`** — same pattern as `free_guide_view`, not yet built.
- **`discovery_call_booked`** — **cannot be tracked from this site at all**
  as currently built. The discovery call happens entirely on Calendly's own
  page after the visitor leaves this site. The only way to know a call was
  actually booked (not just clicked into) is a **Calendly webhook** posted
  to the Altitude backend, which would need to be built server-side. This is
  a real feature, not a config change — flagged in `IMPLEMENTATION_PLAN.md`
  as needing your go-ahead.

## What I need from you

I can't create a Google Analytics account or a Meta Business Manager pixel
on your behalf — that requires you to sign in with your own Google/Meta
account. Two options:

**Option A — GA4 (recommended, free, privacy-reasonable):**
1. Go to [analytics.google.com](https://analytics.google.com), create a
   property for `thealtitudemindset.com`.
2. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`).
3. Send it to me — I'll paste it into `CONFIG.ga4MeasurementId` in
   `assets/js/site.js` and add the GA4 script tag to every page. That one
   line switches on every event in the table above simultaneously, because
   the dispatcher is already wired.

**Option B — Meta Pixel (if you plan to run Instagram/Facebook ads):**
Same process via Meta Events Manager; give me the Pixel ID and I'll fill in
`CONFIG.metaPixelId`.

You can do both — the dispatcher already supports sending to each
independently, and does nothing extra if one is left blank.

## Privacy note

Adding GA4 or Meta Pixel means the privacy policy's existing "Meta Pixel"
disclosure (already present, describing it as something used "if I run
Meta campaigns") stays accurate as-is. If GA4 is added, the privacy policy
should get one added line naming Google Analytics — a two-minute edit once
you confirm you're doing this.
