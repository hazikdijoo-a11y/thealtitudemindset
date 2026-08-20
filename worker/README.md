# Payments backend

A Cloudflare Worker that handles Razorpay for thealtitudemindset.com.

## Why a backend at all

Razorpay Checkout cannot be trusted from the browser alone. Two things
have to happen on a server you control, or payments can be faked:

1. **The amount is decided server-side.** The browser sends only an item
   key (`coaching_session`). If the browser could send the price, someone
   could pay ₹1 for a ₹3,500 session.
2. **The signature is verified server-side.** After payment, Razorpay
   returns a signature. Anyone can call the browser's success callback by
   hand; only the HMAC check proves a payment really happened.

## Deploying

From this folder:

```bash
npm install
```

Log in to Cloudflare (opens a browser):

```bash
npx wrangler login
```

Add your Razorpay keys as secrets. **Run these yourself — the values are
typed into the prompt and never written into the repo.** Get them from
Razorpay Dashboard → Account & Settings → API Keys:

```bash
npx wrangler secret put RAZORPAY_KEY_ID
```

```bash
npx wrangler secret put RAZORPAY_KEY_SECRET
```

Deploy:

```bash
npx wrangler deploy
```

Wrangler prints a URL like `https://altitude-payments.<you>.workers.dev`.
Copy it into `assets/js/pay.js` as `API_BASE`, then commit and push.

## Switching payments on in the site

1. Set `API_BASE` in `assets/js/pay.js`.
2. Add `<script src="/assets/js/pay.js" defer></script>` to whichever page
   should take payment.
3. Add a button: `<button class="btn btn--primary" data-pay="coaching_session">Pay ₹3,500</button>`

Until step 1 is done, `pay.js` does nothing at all.

## Prices

Prices live in `CATALOGUE` at the top of `src/index.js`, in paise
(₹3,500 = 350000). Change them there and redeploy — and keep them in step
with the prices shown on the site.

## Webhooks (optional, recommended)

The browser can close before it confirms a payment. A webhook is the
reliable record.

In Razorpay Dashboard → Settings → Webhooks, add
`<your-worker-url>/api/webhook`, subscribe to `payment.captured`, and set
a webhook secret. Then:

```bash
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
```

Note this is a *different* value from the API key secret.

## Watching it work

```bash
npx wrangler tail
```

## Test mode first

Razorpay gives you `rzp_test_…` keys. Deploy with those, pay with test
card `4111 1111 1111 1111` (any future expiry, any CVV), confirm the
money shows in the dashboard, then swap in the live keys and redeploy.
