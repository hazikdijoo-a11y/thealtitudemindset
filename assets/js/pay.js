/**
 * Razorpay checkout for thealtitudemindset.com
 *
 * Inert until API_BASE below is filled in. Nothing on the site calls this
 * yet — add a button like the example at the bottom when you want it live.
 */
(function () {
  'use strict';

  /* Your deployed Worker URL. Either the workers.dev URL that
     `wrangler deploy` prints, or https://thealtitudemindset.com if you
     enabled the custom route. Empty = payments disabled. */
  var API_BASE = '';

  var CHECKOUT_JS = 'https://checkout.razorpay.com/v1/checkout.js';
  var sdk = null;

  function loadSdk() {
    if (sdk) return sdk;
    sdk = new Promise(function (resolve, reject) {
      if (window.Razorpay) return resolve();
      var s = document.createElement('script');
      s.src = CHECKOUT_JS;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Could not load Razorpay.')); };
      document.head.appendChild(s);
    });
    return sdk;
  }

  function post(path, body) {
    return fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Request failed.');
        return data;
      });
    });
  }

  /**
   * pay('coaching_session', { name, email }, { onDone, onFail })
   * The amount is decided by the server — nothing here can change it.
   */
  function pay(item, customer, handlers) {
    customer = customer || {};
    handlers = handlers || {};
    var done = handlers.onDone || function () {};
    var fail = handlers.onFail || function (m) { alert(m); };

    if (!API_BASE) return fail('Payments are not switched on yet.');

    return loadSdk()
      .then(function () { return post('/api/create-order', {
        item: item, name: customer.name, email: customer.email, note: customer.note
      }); })
      .then(function (order) {
        var rzp = new window.Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: 'Hazik Fayaz',
          description: order.label,
          image: 'https://thealtitudemindset.com/assets/img/nlp-badge-160.png',
          theme: { color: '#0B1B33' },
          prefill: { name: customer.name || '', email: customer.email || '' },
          handler: function (res) {
            // Never treat this callback as proof of payment — the browser
            // can fake it. Only the server's verdict counts.
            post('/api/verify', {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature
            }).then(function (v) {
              if (v.verified) {
                if (window.AltitudeTrack) window.AltitudeTrack('payment_success', { item: item });
                done(v);
              } else {
                fail('We could not confirm that payment. Please email hazikdijoo@gmail.com before paying again.');
              }
            }).catch(function () {
              fail('Payment taken, but confirmation failed. Please email hazikdijoo@gmail.com — do not pay twice.');
            });
          },
          modal: {
            ondismiss: function () {
              if (window.AltitudeTrack) window.AltitudeTrack('payment_dismissed', { item: item });
            }
          }
        });
        rzp.on('payment.failed', function (e) {
          fail((e && e.error && e.error.description) || 'Payment failed.');
        });
        if (window.AltitudeTrack) window.AltitudeTrack('payment_started', { item: item });
        rzp.open();
      })
      .catch(function (err) { fail(err.message || 'Something went wrong.'); });
  }

  window.AltitudePay = { pay: pay, enabled: function () { return !!API_BASE; } };

  /* Any element with data-pay="coaching_session" becomes a pay button. */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-pay]');
    if (!el) return;
    e.preventDefault();
    var label = el.textContent;
    el.setAttribute('aria-busy', 'true');
    pay(el.getAttribute('data-pay'), {}, {
      onDone: function () { el.textContent = 'Paid ✓'; el.removeAttribute('aria-busy'); },
      onFail: function (m) { el.textContent = label; el.removeAttribute('aria-busy'); alert(m); }
    });
  });

  /* Example markup — add to /coaching/ when you are ready:
     <button class="btn btn--primary" data-pay="coaching_session">
       Pay ₹3,500 for a session
     </button>
  */
})();
