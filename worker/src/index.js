/**
 * Payments backend for thealtitudemindset.com
 * Cloudflare Worker — no server to run, no secrets in the repo.
 *
 * Why this exists: Razorpay Checkout cannot be trusted from the browser
 * alone. Two things must happen server-side or payments can be faked:
 *   1. The AMOUNT is decided here, never accepted from the client.
 *   2. The payment SIGNATURE is verified here after Razorpay redirects back.
 *
 * Secrets (set with `wrangler secret put`, never committed):
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 *   RAZORPAY_WEBHOOK_SECRET   (optional, only if you enable webhooks)
 */

/* ---------------------------------------------------------------------
   Price catalogue — the single source of truth for what things cost.
   The browser sends only an item key; it can never send an amount.
   Amounts are in paise (₹3,500 = 350000).
   Keep these in step with the prices shown on the site.
   --------------------------------------------------------------------- */
const CATALOGUE = {
  coaching_session: {
    amount: 350000,
    currency: 'INR',
    label: '1-on-1 NLP & Mindset Coaching — single session'
  },
  cabin_crew_session: {
    amount: 250000,
    currency: 'INR',
    label: 'Cabin Crew Training — single session'
  }
};

const ALLOWED_ORIGINS = [
  'https://thealtitudemindset.com',
  'https://www.thealtitudemindset.com'
];

/* ---------------------------------------------------------------- utils */

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
  });
}

/** HMAC-SHA256, hex encoded. */
async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time compare — a plain === leaks timing information. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function basicAuth(id, secret) {
  return 'Basic ' + btoa(`${id}:${secret}`);
}

/* -------------------------------------------------------------- handlers */

/**
 * POST /api/create-order
 * Body: { item: "coaching_session", name?, email?, note? }
 * Returns: { orderId, amount, currency, keyId, label }
 */
async function createOrder(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400, origin);
  }

  const product = CATALOGUE[body.item];
  if (!product) {
    return json({ error: 'Unknown item.' }, 400, origin);
  }

  // Contact details are optional and only travel as Razorpay notes.
  const notes = {
    item: body.item,
    name: String(body.name || '').slice(0, 120),
    email: String(body.email || '').slice(0, 160),
    note: String(body.note || '').slice(0, 300)
  };

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET)
    },
    body: JSON.stringify({
      amount: product.amount,          // server-decided, never from the client
      currency: product.currency,
      receipt: `tam_${Date.now()}`,
      notes
    })
  });

  if (!res.ok) {
    // Never surface Razorpay's raw error (it can echo account details).
    console.error('razorpay order failed', res.status, await res.text());
    return json({ error: 'Could not start the payment. Please try again.' }, 502, origin);
  }

  const order = await res.json();
  return json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,       // publishable — safe in the browser
    label: product.label
  }, 200, origin);
}

/**
 * POST /api/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Returns: { verified: true } — only ever trust this, never the browser.
 */
async function verifyPayment(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400, origin);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return json({ verified: false, error: 'Missing payment fields.' }, 400, origin);
  }

  const expected = await hmacHex(
    env.RAZORPAY_KEY_SECRET,
    `${razorpay_order_id}|${razorpay_payment_id}`
  );

  if (!safeEqual(expected, razorpay_signature)) {
    console.warn('signature mismatch for order', razorpay_order_id);
    return json({ verified: false, error: 'Payment could not be verified.' }, 400, origin);
  }

  return json({ verified: true, paymentId: razorpay_payment_id }, 200, origin);
}

/**
 * POST /api/webhook
 * Razorpay -> here, server to server. Signed with the WEBHOOK secret,
 * which is a different value from the API key secret.
 * This is the reliable record: it still fires if the customer closes
 * the tab before the browser can call /api/verify.
 */
async function webhook(request, env) {
  const raw = await request.text();                       // must hash the RAW body
  const given = request.headers.get('x-razorpay-signature') || '';
  const secret = env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) return new Response('Webhooks not configured.', { status: 501 });

  const expected = await hmacHex(secret, raw);
  if (!safeEqual(expected, given)) {
    return new Response('Bad signature.', { status: 400 });
  }

  const event = JSON.parse(raw);
  // Razorpay retries until it gets a 2xx, so keep this fast and idempotent.
  console.log('razorpay webhook:', event.event, event?.payload?.payment?.entity?.id);
  return new Response('ok', { status: 200 });
}

/* ------------------------------------------------------------------ entry */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // The webhook is server-to-server and carries no browser Origin.
    if (url.pathname === '/api/webhook' && request.method === 'POST') {
      return webhook(request, env);
    }

    // Everything else must come from the site itself.
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: 'Forbidden origin.' }, 403, origin);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405, origin);
    }

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      return json({ error: 'Payments are not configured yet.' }, 503, origin);
    }

    switch (url.pathname) {
      case '/api/create-order': return createOrder(request, env, origin);
      case '/api/verify':       return verifyPayment(request, env, origin);
      default:                  return json({ error: 'Not found.' }, 404, origin);
    }
  }
};
