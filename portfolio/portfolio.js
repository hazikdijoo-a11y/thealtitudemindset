/* =============================================================
   Portfolio page: featured products, "also built" ledger and the
   case-study panel. Reads window.ALTITUDE_PROJECTS (projects.js).
   Vanilla JS. Case studies are linkable: /portfolio/#project/<slug>
   ============================================================= */
(function () {
  'use strict';

  var projects = window.ALTITUDE_PROJECTS || [];
  var featuredList = document.getElementById('featured-list');
  var moreList = document.getElementById('more-list');
  var dialog = document.getElementById('case');
  if (!featuredList || !moreList || !projects.length) return;

  var STATUS = {
    'live': 'Live',
    'built': 'Built',
    'in-development': 'In development',
    'prototype': 'Prototype'
  };
  var RANK = { 'live': 0, 'built': 1, 'in-development': 2, 'prototype': 3 };

  /* Tiny element helper: text is always set as text, never as HTML. */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'className') node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  function badge(status) {
    return el('span', { className: 'badge badge--' + status, text: STATUS[status] || status });
  }

  /* ---------- Counts shown in the facts row ---------- */
  document.querySelectorAll('[data-count]').forEach(function (node) {
    var k = node.getAttribute('data-count');
    node.textContent = k === 'live'
      ? projects.filter(function (p) { return p.status === 'live'; }).length
      : projects.length;
  });

  /* ---------- Featured products: room for real screenshots ---------- */
  function shot(g, cls, eager) {
    return el('figure', { className: cls }, [
      el('img', { src: g.src, alt: g.alt, width: String(g.w), height: String(g.h), loading: eager ? 'eager' : 'lazy', decoding: 'async' })
    ]);
  }

  function feature(p, index) {
    var shots = p.gallery || [];
    var desktop = shots.filter(function (g) { return g.kind === 'desktop'; })[0];
    var mobile = shots.filter(function (g) { return g.kind === 'mobile'; })[0];

    var media = el('div', { className: 'pf-feature__media' }, [
      desktop ? shot(desktop, 'pf-shot', index === 0) : null,
      mobile ? shot(mobile, 'pf-shot pf-shot--phone', false) : null
    ]);

    var actions = el('div', { className: 'pf-feature__actions' });
    if (p.liveUrl) {
      actions.appendChild(el('a', { className: 'btn btn--gold', href: p.liveUrl, target: '_blank', rel: 'noopener', 'data-track': 'feature_live' }, [
        p.liveLabel || 'Open live',
        el('span', { className: 'sr-only', text: ' (opens in a new tab)' }),
        el('span', { 'aria-hidden': 'true', text: ' ↗' })
      ]));
    }
    actions.appendChild(el('a', { className: 'pf-textlink', href: '#project/' + p.slug, 'data-track': 'case_study_open', 'aria-label': 'Read the case study: ' + p.name }, [
      'Read the case study', el('span', { className: 'arr', 'aria-hidden': 'true', text: '→' })
    ]));

    var copy = el('div', { className: 'pf-feature__copy' }, [
      el('div', { className: 'pf-feature__meta' }, [badge(p.status), el('span', { text: (p.categories || []).join(' · ') })]),
      el('h3', { text: p.name }),
      el('p', { className: 'pf-feature__tag', text: p.tagline }),
      el('ul', { className: 'pf-feature__points' }, (p.highlights || []).map(function (h) { return el('li', { text: h }); })),
      el('ul', { className: 'pf-feature__tech', 'aria-label': 'Built with' }, (p.tech || []).slice(0, 6).map(function (t) { return el('li', { text: t }); })),
      actions
    ]);

    return el('li', { className: 'pf-feature' }, [media, copy]);
  }

  /* ---------- Everything else: a scannable ledger ---------- */
  function ledgerRow(p) {
    var link = el('a', { href: '#project/' + p.slug, 'data-track': 'case_study_open', 'aria-label': 'Case study: ' + p.name + ' (' + (STATUS[p.status] || p.status) + ')' }, [
      el('span', { className: 'pf-ledger__name' }, [el('b', { text: p.name }), el('small', { text: (p.categories || []).join(' · ') })]),
      el('span', { className: 'pf-ledger__tag', text: p.tagline }),
      badge(p.status),
      el('span', { className: 'arr', 'aria-hidden': 'true', text: '→' })
    ]);
    return el('li', {}, [link]);
  }

  var featured = projects.filter(function (p) { return p.featured; })
    .sort(function (a, b) { return a.featured - b.featured; });
  var rest = projects.filter(function (p) { return !p.featured; })
    .sort(function (a, b) { return (RANK[a.status] || 0) - (RANK[b.status] || 0); });

  featuredList.textContent = '';
  featured.forEach(function (p, i) { featuredList.appendChild(feature(p, i)); });
  rest.forEach(function (p) { moreList.appendChild(ledgerRow(p)); });

  /* ---------- Case study panel ---------- */
  var lastTrigger = null;
  var LAYER_ORDER = ['Frontend', 'Backend', 'Database', 'Authentication', 'Payments', 'Admin', 'Integrations', 'Deployment'];

  function section(title, body) {
    return el('section', { className: 'case__section' }, [el('h3', { text: title }), body]);
  }

  function fill(p) {
    var body = document.getElementById('case-body');
    body.textContent = '';
    document.getElementById('case-crumb').textContent = (p.categories || []).join(' · ');

    var actions = el('div', { className: 'case__actions' });
    if (p.liveUrl) {
      actions.appendChild(el('a', { className: 'btn btn--primary', href: p.liveUrl, target: '_blank', rel: 'noopener', 'data-track': 'case_study_live' }, [
        p.liveLabel || 'View live', el('span', { className: 'sr-only', text: ' (opens in a new tab)' }), el('span', { 'aria-hidden': 'true', text: ' ↗' })
      ]));
    }
    actions.appendChild(el('a', { className: 'btn btn--ghost', href: '#start', 'data-close': '' }, ['Start a similar project']));

    body.appendChild(el('header', { className: 'case__head' }, [
      el('div', { className: 'case__status' }, [badge(p.status), el('span', { text: p.statusNote || '' })]),
      el('h2', { id: 'case-title', tabindex: '-1', text: p.name }),
      el('p', { className: 'case__lede', text: p.tagline }),
      actions
    ]));

    // Product preview: real screenshots, or an honest note about why not
    var shots = p.gallery || [];
    if (shots.length) {
      body.appendChild(el('div', { className: 'case__gallery' }, shots.map(function (g) {
        return el('figure', { className: g.kind === 'mobile' ? 'is-mobile' : 'is-desktop' }, [
          // Eager: the gallery sits at the top of a panel that is already open
          el('img', { src: g.src, alt: g.alt, width: String(g.w), height: String(g.h), decoding: 'async' }),
          el('figcaption', { text: g.kind === 'mobile' ? 'Phone' : 'Desktop' })
        ]);
      })));
      if (p.previewNote) body.appendChild(el('p', { className: 'case__noshot', text: p.previewNote }));
    } else {
      body.appendChild(el('p', { className: 'case__noshot', text: p.previewNote || 'Screenshots to be added.' }));
    }

    body.appendChild(el('div', { className: 'case__ps' }, [
      el('div', {}, [el('h3', { text: 'The problem' }), el('p', { text: p.problem })]),
      el('div', {}, [el('h3', { text: 'The solution' }), el('p', { text: p.solution })])
    ]));

    var layers = p.layers || {};
    var rows = LAYER_ORDER.filter(function (k) { return layers[k]; }).map(function (k) {
      return el('div', {}, [el('dt', { text: k }), el('dd', { text: layers[k] })]);
    });
    if (rows.length) body.appendChild(section('What I built', el('dl', { className: 'case__layers' }, rows)));

    if ((p.features || []).length) {
      body.appendChild(section('Key features', el('ul', { className: 'case__features' }, p.features.map(function (f) {
        return el('li', {}, [el('b', { text: f.title }), el('span', { text: f.text })]);
      }))));
    }
    if ((p.tech || []).length) {
      body.appendChild(section('Technology', el('ul', { className: 'case__tech' }, p.tech.map(function (t) { return el('li', { text: t }); }))));
    }
    body.appendChild(section('Status', el('p', { className: 'case__notyet' }, [
      el('b', { text: (STATUS[p.status] || p.status) + '. ' }),
      (p.statusNote ? p.statusNote + '. ' : '') + (p.notYet || '')
    ])));

    body.appendChild(el('div', { className: 'case__cta' }, [
      el('div', {}, [el('h3', { text: 'Have something similar in mind?' }), el('p', { text: 'Tell me the problem and I’ll tell you honestly what it takes to build.' })]),
      el('a', { className: 'btn btn--gold', href: '#start', 'data-close': '', 'data-track': 'case_study_start' }, ['Start a Project ', el('span', { className: 'arr', 'aria-hidden': 'true', text: '→' })])
    ]));
  }

  function slugFromHash() {
    var m = /^#project\/([a-z0-9-]+)$/.exec(location.hash);
    return m ? m[1] : null;
  }

  function openCase(slug) {
    var p = projects.filter(function (x) { return x.slug === slug; })[0];
    if (!p || !dialog) return;
    fill(p);
    document.title = p.name + ' — Case study | Altitude Mindset';
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    dialog.querySelector('.case__scroll').scrollTop = 0;
    var h = document.getElementById('case-title');
    if (h) h.focus({ preventScroll: true });
    if (window.AltitudeTrack) window.AltitudeTrack('case_study_view', { project: slug });
  }

  var baseTitle = document.title;
  function closeCase(nextHash) {
    if (!dialog || !dialog.open) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.title = baseTitle;
    if (slugFromHash()) history.replaceState(null, '', location.pathname + (nextHash || ''));
    if (lastTrigger && !nextHash) lastTrigger.focus({ preventScroll: true });
  }

  if (dialog) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#project/"]');
      if (a) lastTrigger = a;
    });
    window.addEventListener('hashchange', function () {
      var slug = slugFromHash();
      if (slug) openCase(slug); else closeCase();
    });
    dialog.addEventListener('close', function () {
      document.title = baseTitle;
      if (slugFromHash()) history.replaceState(null, '', location.pathname);
    });
    // Click on the dimmed backdrop closes the panel
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeCase();
    });
    dialog.querySelector('.case__close').addEventListener('click', function () { closeCase(); });
    // "Start a project" inside the panel: close it here; site.js then scrolls
    // to #start and moves focus there (this listener runs first).
    dialog.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeCase('#start');
    });
    if (slugFromHash()) openCase(slugFromHash());
  }

  /* ---------- Structured data from the same source ---------- */
  try {
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Software products designed and built by Hazik Fayaz',
      itemListElement: projects.map(function (p, i) {
        var item = {
          '@type': 'SoftwareApplication',
          name: p.name,
          description: p.tagline,
          applicationCategory: (p.categories || [])[0],
          creator: { '@type': 'Person', name: 'Hazik Fayaz', url: 'https://thealtitudemindset.com/about/' },
          url: 'https://thealtitudemindset.com/portfolio/#project/' + p.slug
        };
        if (p.image) item.image = 'https://thealtitudemindset.com' + p.image.src;
        if (p.liveUrl) item.sameAs = p.liveUrl;
        return { '@type': 'ListItem', position: i + 1, item: item };
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  } catch (err) { /* structured data is optional */ }
})();
