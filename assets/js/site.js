/* =============================================================
   The Altitude Mindset — site behaviour
   Vanilla JS, no dependencies, deferred.
   ============================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------
     CONFIG — edit these values, nothing else.
     Analytics stays OFF until you paste a real ID below.
     Nothing here is invented; both fields ship empty on purpose.
     ----------------------------------------------------------- */
  var CONFIG = {
    // Google Analytics 4, e.g. 'G-XXXXXXXXXX'. Empty = disabled.
    ga4MeasurementId: '',
    // Meta Pixel ID, e.g. '123456789012345'. Empty = disabled.
    metaPixelId: '',
    // Formspree endpoint currently in use for both forms.
    formEndpoint: 'https://formspree.io/f/meeyjedo'
  };

  /* -----------------------------------------------------------
     Analytics dispatcher
     Every CTA on the site carries data-track="event_name".
     Until an ID above is filled in, track() logs nothing and
     sends nothing — it simply no-ops. Cloudflare Web Analytics
     (already in the <head>) keeps recording pageviews either way.
     ----------------------------------------------------------- */
  function track(event, params) {
    params = params || {};
    if (CONFIG.ga4MeasurementId && typeof window.gtag === 'function') {
      window.gtag('event', event, params);
    }
    if (CONFIG.metaPixelId && typeof window.fbq === 'function') {
      window.fbq('trackCustom', event, params);
    }
  }
  window.AltitudeTrack = track;

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    track(el.getAttribute('data-track'), {
      link_url: el.getAttribute('href') || '',
      link_text: (el.textContent || '').trim().slice(0, 80),
      page: location.pathname
    });
  });

  /* -----------------------------------------------------------
     Mobile navigation drawer
     ----------------------------------------------------------- */
  var toggle = document.querySelector('.nav__toggle');
  var drawer = document.getElementById('nav-drawer');

  function setDrawer(open) {
    if (!toggle || !drawer) return;
    drawer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        setDrawer(false);
        toggle.focus();
      }
    });
    // Never leave the drawer open when the desktop nav takes over.
    var wide = window.matchMedia('(min-width: 1041px)');
    (wide.addEventListener ? wide.addEventListener.bind(wide, 'change') : wide.addListener.bind(wide))(
      function (ev) { if (ev.matches) setDrawer(false); }
    );
  }

  /* -----------------------------------------------------------
     Same-page anchor scrolling (accounts for the sticky header)
     ----------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#' || href.length < 2) { e.preventDefault(); return; }

    var target = document.getElementById(href.slice(1));
    if (!target) return;

    e.preventDefault();
    var header = document.querySelector('.site-header');
    var offset = header ? header.offsetHeight + 12 : 0;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
    setDrawer(false);

    // Keep keyboard focus in step with the visual jump.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', href);
  });

  /* -----------------------------------------------------------
     Forms — contact + lead magnet, both posting to Formspree
     ----------------------------------------------------------- */
  function wireForm(form) {
    if (!form) return;
    var btn = form.querySelector('[type="submit"]');
    var status = form.querySelector('.form__status');
    var successMsg = form.getAttribute('data-success') || 'Thanks — your message is on its way.';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      if (status) { status.textContent = ''; status.className = 'form__status'; }

      fetch(form.action || CONFIG.formEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('bad status ' + res.status);
        if (btn) { btn.textContent = 'Sent ✓'; }
        if (status) {
          status.textContent = successMsg;
          status.className = 'form__status is-ok';
          // Deliver the file immediately rather than promising an email
          // that would have to be sent by hand.
          var file = form.getAttribute('data-deliver');
          if (file) {
            var a = document.createElement('a');
            a.href = file; a.className = 'form__deliver'; a.setAttribute('download', '');
            a.textContent = 'Download the guide (PDF)';
            status.appendChild(document.createElement('br'));
            status.appendChild(a);
          }
        }
        form.reset();
        track(form.getAttribute('data-track-submit') || 'form_submit', { form_id: form.id || '' });
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (status) {
          status.textContent = 'That didn’t go through. Please try again, or email hazikdijoo@gmail.com.';
          status.className = 'form__status is-error';
        }
      });
    });
  }

  wireForm(document.getElementById('contact-form'));
  wireForm(document.getElementById('magnet-form'));

  /* -----------------------------------------------------------
     Scroll reveal — skipped entirely for reduced-motion users
     ----------------------------------------------------------- */
  var items = document.querySelectorAll('.reveal');
  if (items.length) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      items.forEach(function (el) { io.observe(el); });
    }
  }

  /* -----------------------------------------------------------
     Instagram embed fallback
     ----------------------------------------------------------- */
  var reel = document.getElementById('reel-embed');
  var reelFallback = document.getElementById('reel-fallback');
  if (reel && reelFallback) {
    setTimeout(function () {
      if (!reel.querySelector('iframe')) {
        reel.hidden = true;
        reelFallback.hidden = false;
      }
    }, 4000);
  }
})();
