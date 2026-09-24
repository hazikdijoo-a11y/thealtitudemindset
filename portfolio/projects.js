/* =============================================================
   Portfolio project data — the single source for the project
   grid, the filters, the case-study panel and the structured data.

   To add a project, add one object below. Only write what is true:
   every line here was checked against the project's own code, README
   or build notes. Leave a field out rather than guess.

   status:   'live' | 'built' | 'in-development' | 'prototype'
   filters:  any of 'web', 'mobile', 'business', 'offline'
             ('live' is derived from status)
   gallery:  real screenshots only. With none, the page shows a
             labelled placeholder and `previewNote` explains why.
   ============================================================= */
window.ALTITUDE_PROJECTS = [
  {
    slug: 'shiftreset',
    featured: 1,
    highlights: [
      'A 24-question assessment across six life areas builds a personal Reset Profile',
      'Six programs with 92 daily actions and progress tracking',
      'Razorpay checkout; a refund removes access automatically'
    ],
    name: 'SHIFTRESET',
    tagline: 'A personal-transformation platform with an assessment, daily programs and paid courses.',
    status: 'live',
    statusNote: 'Live at shiftreset.in',
    year: 2026,
    categories: ['Web platform', 'Personal development'],
    filters: ['web'],
    built: ['Accounts', 'Assessment & scoring', 'Daily programs', 'Razorpay payments', 'Refund handling', 'Android & iOS wrappers'],
    liveUrl: 'https://shiftreset.in',
    liveLabel: 'Visit shiftreset.in',
    image: { src: '/assets/img/work/shiftreset-card.webp?v=20260924', alt: 'SHIFTRESET home page: “Reset what’s holding you back.”' },
    gallery: [
      { src: '/assets/img/work/shiftreset-desktop.webp?v=20260924', w: 1200, h: 750, kind: 'desktop', alt: 'SHIFTRESET home page on desktop' },
      { src: '/assets/img/work/shiftreset-mobile.webp?v=20260924', w: 360, h: 720, kind: 'mobile', alt: 'SHIFTRESET home page on a phone' }
    ],
    problem: 'People who feel stuck rarely know which part of life to work on first, and general advice seldom turns into daily action.',
    solution: 'A 24-question assessment across six areas (mindset, career, relationships, confidence, productivity and life) finds where to start and builds a Reset Profile. The person then enrols in a daily-action program that tracks their progress. Paid programs are sold through Razorpay.',
    layers: {
      Frontend: 'Next.js 16 App Router, React 19, Tailwind CSS v4',
      Backend: 'Next.js server components, server actions and route handlers',
      Database: 'PostgreSQL on Neon through Prisma 7, money stored in paise as integers',
      Authentication: 'Opaque session tokens in httpOnly cookies; only a SHA-256 hash is stored',
      Payments: 'Razorpay checkout for one-time program purchases. A signed webhook settles payments and removes access on refund.',
      Deployment: 'Netlify, deployed from GitHub; database migrations run during the build. An Android app (Trusted Web Activity) and an iOS app (native shell) are built around the site.'
    },
    features: [
      { title: 'Assessment & scoring', text: '24 questions, six areas, unit-tested scoring. The lowest-scoring area becomes the primary reset.' },
      { title: 'Programs that run daily', text: 'Six programs with 92 daily actions, plus progress tracking and streaks.' },
      { title: 'Payments and refunds', text: 'Tested end to end with a real payment and a real refund, including access removed on refund.' },
      { title: 'Accessibility pass', text: 'Every text colour checked against every background for AA contrast; buttons and links at least 44 px.' },
      { title: 'Honest guardrails', text: 'Clearly not a medical service, with scores presented as self-reflection, never as clinical measurement.' }
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'Neon', 'Razorpay', 'Netlify'],
    notYet: 'Planned but not built yet: an AI coach, in-app coaching booking, journal and goals screens, an admin dashboard and notifications. The Android and iOS apps are built but not yet released on the stores.'
  },
  {
    slug: 'altitude-backend',
    featured: 3,
    highlights: [
      'Prices are set on the server; the browser never sends an amount',
      'Signed webhooks that are safe to repeat, so a retry never double-counts',
      '50 automated tests running against a real Postgres database'
    ],
    name: 'Altitude Mindset — Payments Backend',
    shortName: 'Payments Backend',
    tagline: 'The payments and enquiries backend behind this website.',
    status: 'live',
    statusNote: 'Live at api.thealtitudemindset.com',
    year: 2026,
    categories: ['Payments', 'Backend'],
    filters: ['web', 'business'],
    built: ['Razorpay payments', 'Signed webhooks', 'Admin dashboard', 'Lead capture', '50 automated tests'],
    liveUrl: 'https://api.thealtitudemindset.com/checkout',
    liveLabel: 'See the live checkout',
    image: { src: '/assets/img/work/altitude-backend-card.webp?v=20260924', alt: 'The live checkout page: book a coaching or cabin crew session through Razorpay' },
    gallery: [
      { src: '/assets/img/work/altitude-backend-desktop.webp?v=20260924', w: 1200, h: 650, kind: 'desktop', alt: 'Checkout page on desktop' },
      { src: '/assets/img/work/altitude-backend-mobile.webp?v=20260924', w: 360, h: 720, kind: 'mobile', alt: 'Checkout page on a phone' }
    ],
    previewNote: 'The admin dashboard holds real enquiries, so only the public checkout is shown.',
    problem: 'This site needed to take real payments for sessions and keep every enquiry in one place, without ever trusting a price sent from the browser.',
    solution: 'A small Node.js service on Netlify Functions with a Postgres database. It serves the checkout page, confirms every payment with Razorpay and keeps a copy of each enquiry sent from this site’s forms.',
    layers: {
      Frontend: 'Server-rendered checkout and admin pages',
      Backend: 'Node.js without a framework: one request handler shared by the local server and the Netlify Function',
      Database: 'PostgreSQL on Neon; migrations are idempotent and run under an advisory lock',
      Authentication: 'Admin sign-in with an scrypt-hashed password; only a SHA-256 hash of each session token is stored',
      Payments: 'Razorpay Standard Checkout. The price comes from a server-side catalogue, and each payment is checked with an HMAC-SHA256 signature.',
      Admin: 'Dashboard for enquiries and payments',
      Integrations: 'This website’s contact and guide forms; Razorpay webhooks',
      Deployment: 'Netlify Functions on api.thealtitudemindset.com'
    },
    features: [
      { title: 'Prices set on the server', text: 'The browser only names what it’s paying for; the amount always comes from the server.' },
      { title: 'Webhooks that are safe to repeat', text: 'Each event is recorded before it’s processed, so a retry never double-counts, and a paid order is never downgraded.' },
      { title: 'Rate limits that work serverless', text: 'Limits are stored in Postgres, because separate function instances share no memory.' },
      { title: 'Locked-down browser access', text: 'Only this site’s own addresses can call the API from a browser.' },
      { title: 'Tested against a real database', text: '50 automated tests run against Postgres, and the suite refuses to run on anything but a test database.' }
    ],
    tech: ['Node.js', 'PostgreSQL', 'Neon', 'Razorpay', 'Netlify Functions', 'node:test'],
    notYet: ''
  },
  {
    slug: 'uwear-hani',
    name: 'U Wear HANI',
    tagline: 'Billing, stock and vendor tracking for a boutique’s shop floor.',
    status: 'live',
    statusNote: 'Private build, in use at the boutique',
    year: 2026,
    categories: ['Business system', 'Retail'],
    filters: ['web', 'mobile', 'business'],
    built: ['PIN sign-in', 'Multi-device sync', 'Inventory', 'Print templates', 'iOS app'],
    previewNote: 'Screenshots are withheld because the app holds the boutique’s live business data.',
    problem: 'A boutique needed one place for billing, material inventory, finished stock and vendor advances, usable from every device in the shop and without paying for cloud hosting.',
    solution: 'An installable web app backed by a small server on the shop’s own Mac. Every device on the shop WiFi signs in with a PIN and works on the same data, and a native iOS shell puts the app on the owner’s phone.',
    layers: {
      Frontend: 'Installable single-file web app (HTML, CSS, JavaScript) with a cache-first service worker',
      Backend: 'Node.js server with no npm dependencies, serving the app and a JSON API on the shop network',
      Database: 'One JSON state file, written atomically',
      Authentication: 'Shared PIN, scrypt-hashed, with a 30-day httpOnly session cookie',
      Integrations: 'Browser printing for 80 mm receipts, A4 invoices and 75 × 150 mm garment swing tags',
      Deployment: 'Self-hosted on the shop’s Mac; iOS app built with SwiftUI and WKWebView'
    },
    features: [
      { title: 'Billing and invoices', text: 'Bills print as 80 mm receipts or A4 invoices in the brand’s own type and logo.' },
      { title: 'Stock and materials', text: 'Material inventory and finished stock, each with required product details.' },
      { title: 'Vendors and advances', text: 'A running record of vendors and the advances paid to them.' },
      { title: 'Sync that never drops an edit', text: 'Devices refresh every 10 seconds and failed saves retry automatically. A refresh can’t overwrite an unsaved change, a bug found and fixed during testing.' },
      { title: 'Garment swing tags', text: 'Print-ready 75 × 150 mm tags, with an optional product photo compressed on the device first.' }
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Service Worker', 'Node.js', 'Swift', 'SwiftUI', 'WKWebView'],
    notYet: 'The iOS app has been verified in the Simulator but not yet on a physical iPhone. Access from outside the shop WiFi was deliberately left out.'
  },
  {
    slug: 'barb-e-crew',
    name: 'Barb-e-Crew',
    tagline: 'B2B ordering and delivery for barbers and salons.',
    status: 'built',
    statusNote: 'Working build with demo data; not launched',
    year: 2026,
    categories: ['B2B commerce', 'Delivery'],
    filters: ['web', 'business'],
    built: ['Staff roles', 'Repeat-order engine', 'Per-centre inventory', 'Admin console', 'Delivery-agent view'],
    previewNote: 'Screenshots to be added.',
    problem: 'Salons reorder the same supplies again and again. Reordering should take one tap, and stock levels and delivery times should reflect the fulfilment centre that actually serves the salon.',
    solution: 'A full-stack ordering platform with a repeat-order engine, per-centre inventory with live delivery estimates, loyalty and referrals, and working admin and delivery-agent views.',
    layers: {
      Frontend: 'Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4',
      Backend: 'Next.js server routes and actions',
      Database: 'Prisma with SQLite, schema written to move to PostgreSQL unchanged',
      Authentication: 'JWT cookie sessions: mobile number and OTP for customers, email and password for staff roles',
      Admin: 'Products, categories, inventory, orders, customers, deliveries, offers and settings'
    },
    features: [
      { title: 'Repeat-order engine', text: 'Regular supplies are ranked by how often and how recently they were bought. Repeat the last order in one tap; any reorder is re-checked against stock.' },
      { title: 'Fulfilment centres', text: 'Checkout reserves stock at the centre serving the customer, and delivery estimates respect opening hours.' },
      { title: 'Loyalty and referrals', text: 'Points, referrals and saved recurring order lists.' },
      { title: 'Delivery-agent view', text: 'A phone-first view for agents to work through and complete deliveries.' },
      { title: 'Verified end to end', text: 'An order was placed as a customer, moved through fulfilment as an operator and completed as a delivery agent.' }
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'SQLite', 'JWT'],
    notYet: 'Not built yet: a payment gateway, a real SMS provider (the OTP is simulated), maps and geocoding, real product photography, and automated tests.'
  },
  {
    slug: 'farm-ledger',
    name: 'Farm Ledger',
    tagline: 'Attendance, wages, advances and farm accounts, built to keep working when the network doesn’t.',
    status: 'in-development',
    statusNote: 'In development; hosted API currently paused',
    year: 2026,
    categories: ['Business system', 'Agriculture'],
    filters: ['web', 'mobile', 'business', 'offline'],
    built: ['Role-based sign-in', 'Offline sync queue', 'Attendance & wages', 'Advances & balances', 'Subscription billing'],
    previewNote: 'Screenshots to be added.',
    problem: 'A farming operation has to track farmer attendance, daily wages, advances and farm expenses, and settle balances accurately, often where the mobile network is unreliable.',
    solution: 'A mobile-first web app for admins and farmers, backed by a Node.js API. Changes made offline are queued on the device and sync when the connection returns.',
    layers: {
      Frontend: 'React and Vite web app with phone-style tab navigation; local database in IndexedDB (Dexie)',
      Backend: 'Node.js and Express REST API with Helmet and rate limiting',
      Database: 'PostgreSQL with plain SQL, portable across hosted Postgres providers',
      Authentication: 'Phone number and password, bcrypt, 12-hour JWTs, admin and farmer roles',
      Admin: 'Farmers, attendance, balances, advances, expenses, sales, stock, crop drying, job cards and reports',
      Integrations: 'Supabase Storage for profile photos; Google Play Billing for trial and subscription',
      Deployment: 'Web app on Vercel; Node.js API on Render, currently paused; Android package built from the web app'
    },
    features: [
      { title: 'Attendance calendar', text: 'Month-by-month attendance per farmer, with a calendar report.' },
      { title: 'Wages and advances', text: 'Daily wage calculation, advance payments and balance sheets.' },
      { title: 'Farm accounts', text: 'Expenses, sales, stock and an overall farm balance.' },
      { title: 'Crop drying and job cards', text: 'A drying calendar and job cards for day-to-day operations.' },
      { title: 'Offline queue', text: 'Advances, expenses, sales and stock can be recorded offline; a banner shows what is still waiting to sync.' }
    ],
    tech: ['React', 'Vite', 'Dexie', 'Node.js', 'Express', 'PostgreSQL', 'JWT', 'Supabase Storage', 'Google Play Billing'],
    notYet: 'The hosted API is paused for now, so the live web app can’t sync until it is switched back on.'
  },
  {
    slug: 'hazik-carwash',
    name: 'Hazik Carwash',
    tagline: 'An on-demand car-wash marketplace with a customer app, a washer app and an operations dashboard.',
    status: 'in-development',
    statusNote: 'In development; customer Android build produced',
    year: 2026,
    categories: ['Marketplace', 'Mobile apps'],
    filters: ['mobile', 'business'],
    built: ['Customer & washer apps', 'Nearest-washer dispatch', 'Razorpay integration', 'Subscriptions', 'Push notifications'],
    previewNote: 'Screenshots to be added.',
    problem: 'Car owners want a wash at their door at a set time. The business has to match each booking to a nearby washer and track it through to completion.',
    solution: 'One codebase holding an API, two React Native apps and an admin dashboard. All of them share the same types and validation rules, so an API change shows up as a type error in the apps instead of a bug in production.',
    layers: {
      Frontend: 'Customer and washer apps in React Native (Expo) with React Navigation and Zustand; admin dashboard in React, Vite, Tailwind CSS and Recharts',
      Backend: 'Node.js, Express and TypeScript, split into modules: auth, bookings, subscriptions, washers, payments, reviews, notifications and admin',
      Database: 'PostgreSQL through Prisma',
      Authentication: 'JWT access and refresh tokens, bcrypt, phone OTP',
      Payments: 'Razorpay orders, signature verification and webhook',
      Admin: 'Operations dashboard with charts',
      Integrations: 'Firebase Cloud Messaging for push; shared zod validation',
      Deployment: 'Docker Compose for local Postgres and Redis; Expo native builds'
    },
    features: [
      { title: 'Nearest-washer dispatch', text: 'Each booking is matched by distance, service radius and time-window conflicts.' },
      { title: 'Booking lifecycle', text: 'Assigned, en route, in progress and completed, with the customer notified at every step.' },
      { title: 'Subscriptions', text: 'An hourly job creates the next booking for every subscription that is due.' },
      { title: 'Ratings', text: 'Customers rate the washer once a booking is complete.' },
      { title: 'Notifications', text: 'Every update is saved in the app and also sent as a push notification when push is configured.' }
    ],
    tech: ['React Native', 'Expo', 'TypeScript', 'React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Razorpay', 'Firebase Cloud Messaging', 'zod'],
    notYet: 'Still to connect: an SMS provider for OTP and social sign-in. Live tracking currently polls every 5 seconds.'
  },
  {
    slug: 'kath',
    name: 'Kath',
    tagline: 'A voice and memory assistant for Android and iOS that works offline first.',
    status: 'built',
    statusNote: 'Built and audited; not publicly released',
    year: 2026,
    categories: ['AI', 'Mobile apps'],
    filters: ['mobile', 'offline'],
    built: ['Voice recording', 'Transcription', 'AI extraction', 'Reminders', 'Search & digest'],
    previewNote: 'Screenshots to be added.',
    problem: 'Things people say out loud, like reminders, ideas and commitments, get lost. Most assistants that could help send everything to the cloud.',
    solution: 'Kath records and transcribes voice notes, pulls out memories and reminders, and keeps them searchable, on the device by default. Cloud AI is optional and uses the person’s own key.',
    layers: {
      Frontend: 'Android in Kotlin and Jetpack Compose; iOS in SwiftUI, as two separate native codebases',
      Database: 'Room with tested migrations on Android; Core Data on iOS',
      Authentication: 'No API keys ship in the app. A key the person adds is stored with Keystore or Keychain encryption, and recordings on iOS use Data Protection.',
      Integrations: 'On-device speech recognition; optional cloud AI extraction',
      Deployment: 'Signed, minified Android release builds; iOS app verified in the Simulator'
    },
    features: [
      { title: 'Record and play back', text: 'Voice capture with a live input level meter.' },
      { title: 'Transcription', text: 'Recordings become searchable text.' },
      { title: 'Memory extraction', text: 'Memories and reminders are pulled out and de-duplicated, on the device or with cloud AI if the person opts in.' },
      { title: 'Reminders and digest', text: 'Notifications, search, and a digest of what was captured.' },
      { title: 'Audited', text: 'The Android app went through a 33-phase audit and a pass to fix what it found. Remaining gaps are written down, not hidden.' }
    ],
    tech: ['Kotlin', 'Jetpack Compose', 'Room', 'Swift', 'SwiftUI', 'Core Data', 'AVFoundation', 'Speech framework', 'XCTest', 'Robolectric'],
    notYet: 'Known gaps: no live location reminders, external microphones not tested on real hardware, no UI tests, and on Android no encryption at rest beyond the phone’s own.'
  },
  {
    slug: 'course-tracker',
    featured: 2,
    highlights: [
      'Each day is an aircraft on a spiral and each turn is a week',
      'Works offline, with no account and no server',
      'Android app now in Google Play internal testing'
    ],
    name: 'Course Tracker',
    tagline: 'A habit tracker drawn as a flight path, with one spiral turn per week.',
    status: 'live',
    statusNote: 'Live; Android app in Google Play internal testing',
    year: 2026,
    categories: ['Productivity', 'Installable web app'],
    filters: ['web', 'mobile', 'offline'],
    built: ['Works offline', 'Installable', 'Android app', 'Export & import', 'No account needed'],
    liveUrl: 'https://tracker.thealtitudemindset.com',
    liveLabel: 'Open Course Tracker',
    image: { src: '/assets/img/work/course-tracker-card.webp?v=20260924', alt: 'Course Tracker: a navy spiral of aircraft, one per day, beside a habit list' },
    gallery: [
      { src: '/assets/img/work/course-tracker-desktop.webp?v=20260924', w: 1200, h: 750, kind: 'desktop', alt: 'Course Tracker on desktop' },
      { src: '/assets/img/work/course-tracker-mobile.webp?v=20260924', w: 360, h: 720, kind: 'mobile', alt: 'Course Tracker on a phone' }
    ],
    previewNote: 'Sample habits and ticks are shown for illustration.',
    problem: 'Habit trackers are usually grids that are easy to ignore. The brief was a tracker you can read at a glance, with no account and no server.',
    solution: 'Each day is an aircraft on a spiral and each turn is a week, so the same weekday always lines up. A day’s colour comes from that day’s habit ticks.',
    layers: {
      Frontend: 'Plain HTML, CSS and JavaScript with no build step; a hand-built SVG spiral',
      Database: 'Stored on the device, with JSON export and import to move between devices',
      Deployment: 'GitHub Pages on its own subdomain; Android app packaged as a Trusted Web Activity'
    },
    features: [
      { title: 'Read it at a glance', text: 'Gold marks a flight day, green means 80% or more done, orange means partly done, and an outline means nothing ticked yet.' },
      { title: 'Up to 60 habits', text: 'Add, reorder and remove habits. Habits added mid-month only count from the day they were added.' },
      { title: 'Works offline', text: 'A service worker keeps the app available with no connection.' },
      { title: 'Your data stays yours', text: 'No account and no server. Export to a file to carry your history to another device.' },
      { title: 'On Android', text: 'A full-screen Android app with no browser bar.' }
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'SVG', 'Service Worker', 'Trusted Web Activity', 'GitHub Pages'],
    notYet: 'The Android app is in internal testing; the production release needs more closed testers.'
  },
  {
    slug: 'little-pilot-academy',
    featured: 4,
    highlights: [
      'Letters, words, numbers and reading, led by a guide character',
      'No sign-up, with large controls made for a young child’s tablet',
      'Installable, with an iOS app packaged'
    ],
    name: 'Little Pilot Academy',
    tagline: 'A playful early-learning app for letters, words, numbers and reading.',
    status: 'live',
    statusNote: 'Live on the web; also packaged for iOS',
    year: 2026,
    categories: ['Education', 'Installable web app'],
    filters: ['web', 'mobile'],
    built: ['Installable', 'iOS app', 'Tablet-friendly UI', 'No account needed'],
    liveUrl: 'https://little-pilot-academy.netlify.app',
    liveLabel: 'Open Little Pilot Academy',
    image: { src: '/assets/img/work/little-pilot-card.webp?v=20260924', alt: 'Little Pilot Academy’s Alphabet Runway: a letter grid with a picture, a sound and a tracing button for each letter' },
    gallery: [
      { src: '/assets/img/work/little-pilot-desktop.webp?v=20260924', w: 1200, h: 750, kind: 'desktop', alt: 'The Alphabet Runway letter screen on desktop' },
      { src: '/assets/img/work/little-pilot-mobile.webp?v=20260924', w: 360, h: 720, kind: 'mobile', alt: 'The Alphabet Runway letter screen on a phone' }
    ],
    previewNote: 'Shown with a demo profile.',
    problem: 'Built for my young daughter, so her learning time doesn’t depend on my flying schedule as cabin crew.',
    solution: 'A friendly learning app led by a guide character. It covers letters, words, numbers and reading, works well on a child’s tablet and needs no account.',
    layers: {
      Frontend: 'React 19, TypeScript, Vite, Tailwind CSS v4, React Router',
      Deployment: 'Installable web app (vite-plugin-pwa); iOS app packaged with Capacitor; static hosting'
    },
    features: [
      { title: 'Four learning areas', text: 'Letters, words, numbers and reading.' },
      { title: 'A guide to follow', text: 'Lumi and her fox lead the way through the app.' },
      { title: 'No sign-up', text: 'An optional nickname is all it asks for.' },
      { title: 'Made for small hands', text: 'Large, friendly controls designed for a young child on a tablet.' }
    ],
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'vite-plugin-pwa', 'Capacitor'],
    notYet: ''
  },
  {
    slug: 'deepika-brown-makeovers',
    featured: 5,
    highlights: [
      'A draggable before-and-after slider for the studio’s nail work',
      'A lookbook whose photos open full size',
      'Tap-to-call and Google Maps directions built in'
    ],
    name: 'Deepika Brown Makeovers',
    tagline: 'A one-page website for a bridal and party makeup studio in Kochi.',
    status: 'live',
    statusNote: 'Live on GitHub Pages',
    year: 2026,
    categories: ['Website', 'Beauty'],
    filters: ['web'],
    built: ['One-page site', 'Before and after slider', 'Lookbook', 'Click to call', 'Directions'],
    liveUrl: 'https://hazikdijoo-a11y.github.io/deepika-brown-makeovers-website/',
    liveLabel: 'Open the website',
    image: { src: '/assets/img/work/deepika-brown-makeovers-card.webp?v=20260924', alt: 'Deepika Brown Makeovers home page: a bride in gold jewellery beside the line “Makeup that lasts as long as the celebration.”' },
    gallery: [
      { src: '/assets/img/work/deepika-brown-makeovers-desktop.webp?v=20260924', w: 1200, h: 750, kind: 'desktop', alt: 'Deepika Brown Makeovers home page on desktop' },
      { src: '/assets/img/work/deepika-brown-makeovers-mobile.webp?v=20260924', w: 360, h: 720, kind: 'mobile', alt: 'Deepika Brown Makeovers home page on a phone' }
    ],
    problem: 'Brides and party guests choose a makeup artist by the work they can see and by how easily they can book. The studio needed a site that shows both.',
    solution: 'A single page with a full-screen hero, About and Services sections, a before-and-after slider, a photo lookbook, reviews and a contact section, with call and directions buttons close at hand.',
    layers: {
      Frontend: 'One hand-written HTML page with its own CSS and JavaScript, set in Cormorant Garamond and Jost',
      Integrations: 'Tap-to-call links and a Google Maps directions link',
      Deployment: 'GitHub Pages, deployed with git push'
    },
    features: [
      { title: 'Before and after slider', text: 'A draggable line reveals a nail-art transformation. It also works with a swipe or the arrow keys.' },
      { title: 'Lookbook', text: 'Recent work in a photo grid; any photo opens full size.' },
      { title: 'One tap to call', text: 'A call button in the header and the contact section, plus a directions link that opens Google Maps.' },
      { title: 'Built light', text: 'Photos are WebP, and all but the first screen’s are loaded only as they come into view.' },
      { title: 'Respects motion settings', text: 'Scroll animations switch off for visitors who ask their device for reduced motion.' }
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'WebP', 'GitHub Pages'],
    notYet: 'Booking happens by phone, so there is no online booking form. There is no structured data or social share image yet, so search results and link previews are basic.'
  },
  {
    slug: 'dijoo-afghan-cap-house',
    featured: 6,
    highlights: [
      'A leather panel where a lamp follows the cursor across the stitching',
      'Call and directions buttons, plus a call bar that appears on phones once the hero scrolls away',
      'Structured data so search engines can read the shop’s address and phone number'
    ],
    name: 'Dijoo Afghan Cap House',
    tagline: 'A one-page website for a small Afghan cap, jacket and leather shop in Lal Chowk, Srinagar.',
    status: 'live',
    statusNote: 'Live on GitHub Pages',
    year: 2026,
    categories: ['Website', 'Retail'],
    filters: ['web'],
    built: ['One-page site', 'Animated leather panel', 'Call bar', 'Directions', 'Structured data'],
    liveUrl: 'https://hazikdijoo-a11y.github.io/dijoo-afghan-cap-house/',
    liveLabel: 'Open the website',
    image: { src: '/assets/img/work/dijoo-afghan-cap-house-card.webp?v=20260924', alt: 'Dijoo Afghan Cap House home page: “Caps, jackets & leather for Kashmir winters” beside a stitched leather panel with an Afghan cap' },
    gallery: [
      { src: '/assets/img/work/dijoo-afghan-cap-house-desktop.webp?v=20260924', w: 1200, h: 750, kind: 'desktop', alt: 'Dijoo Afghan Cap House home page on desktop' },
      { src: '/assets/img/work/dijoo-afghan-cap-house-mobile.webp?v=20260924', w: 360, h: 720, kind: 'mobile', alt: 'Dijoo Afghan Cap House home page on a phone' }
    ],
    problem: 'A shop that sells in person needs a page that says what it stocks, where to find it and how to call. Stock and timings change with the season, so the page sends visitors to call instead of promising them things.',
    solution: 'A single page with a hero, a three-item “What we stock” section and a “Visit the shop” section with the address, phone number and a Google Maps link. The artwork is drawn in SVG, so the page needs no photographs.',
    layers: {
      Frontend: 'One hand-written HTML file with its own CSS and JavaScript, set in Fraunces and Instrument Sans; the cap and the leather panel are drawn in SVG',
      Integrations: 'Tap-to-call links, a Google Maps directions link and schema.org ClothingStore data',
      Deployment: 'GitHub Pages, deployed with git push'
    },
    features: [
      { title: 'Lamp on the leather', text: 'With a mouse, a light follows the pointer across a stitched leather panel. It stays still on touch screens and for visitors who ask for reduced motion.' },
      { title: 'A call bar for phones', text: 'Once the hero buttons scroll out of view, a bar with Call and Directions appears.' },
      { title: 'Honest about what it doesn’t know', text: 'No prices or opening hours are invented. The page says stock and timings change and asks visitors to call before a special trip.' },
      { title: 'Readable by search engines', text: 'schema.org ClothingStore data carries the address and phone number.' },
      { title: 'Accessible basics', text: 'A skip link, visible keyboard focus, and reveal animations that switch off for reduced motion.' }
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'SVG', 'schema.org', 'GitHub Pages'],
    notYet: 'No photographs of the shop or stock, no opening hours and no WhatsApp link yet, because those haven’t been provided. There is no social share image.'
  }
];
