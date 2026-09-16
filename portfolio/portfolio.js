/* =============================================================
   Portfolio page — project grid, filters, case-study panel.
   Reads window.ALTITUDE_PROJECTS (projects.js). Vanilla JS.
   Case studies are linkable: /portfolio/#project/<slug>
   ============================================================= */
(function () {
  'use strict';

  var projects = window.ALTITUDE_PROJECTS || [];
  var grid = document.getElementById('project-grid');
  var filterBar = document.getElementById('project-filters');
  var liveRegion = document.getElementById('project-count');
  var dialog = document.getElementById('case');
  if (!grid || !projects.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STATUS = {
    'live': 'Live',
    'built': 'Built',
    'in-development': 'In development',
    'prototype': 'Prototype'
  };
  var FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'live', label: 'Live now' },
    { key: 'web', label: 'Web apps' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'business', label: 'Business systems' },
    { key: 'offline', label: 'Offline-first' }
  ];

  function matches(p, key) {
    if (key === 'all') return true;
    if (key === 'live') return p.status === 'live';
    return (p.filters || []).indexOf(key) !== -1;
  }
  function count(key) { return projects.filter(function (p) { return matches(p, key); }).length; }

  /* Tiny element helper — text is always set as text, never as HTML. */
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
  function initials(name) {
    return name.replace(/[^A-Za-z ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }
  function placeholder(p) {
    return el('div', { className: 'pf-ph', 'aria-hidden': 'true' }, [
      el('div', { className: 'pf-ph__ui' }),
      el('div', { className: 'pf-ph__mono', text: initials(p.shortName || p.name) }),
      el('span', { className: 'pf-ph__label', text: 'Screenshot coming' })
    ]);
  }

  /* ---------- Counts shown in the facts row ---------- */
  document.querySelectorAll('[data-count]').forEach(function (node) {
    var k = node.getAttribute('data-count');
    node.textContent = k === 'total' ? projects.length : count(k);
  });

  /* ---------- Cards ---------- */
  function card(p, index) {
    var media = el('div', { className: 'pcard__media' + (p.image ? '' : ' is-ph') }, [
      p.image
        ? el('img', { src: p.image.src, alt: p.image.alt, width: '960', height: '600', loading: index < 3 ? 'eager' : 'lazy', decoding: 'async' })
        : placeholder(p),
      badge(p.status)
    ]);
    var chips = el('ul', { className: 'pcard__chips', 'aria-label': 'What was built' },
      (p.built || []).slice(0, 4).map(function (b) { return el('li', { text: b }); }));
    var open = el('a', { className: 'pcard__open', href: '#project/' + p.slug, 'data-track': 'case_study_open' }, [
      'View case study', el('span', { className: 'arr', 'aria-hidden': 'true', text: ' →' })
    ]);
    open.setAttribute('aria-label', 'View case study: ' + p.name);
    return el('li', {}, [
      el('article', { className: 'pcard' }, [
        media,
        el('div', { className: 'pcard__body' }, [
          el('div', { className: 'pcard__meta' }, [
            el('span', { className: 'pcard__cat', text: (p.categories || []).join(' · ') })
          ]),
          el('h3', { text: p.name }),
          el('p', { className: 'pcard__tag', text: p.tagline }),
          chips,
          el('div', { className: 'pcard__cta' }, [open, el('span', { className: 'pcard__year', text: String(p.year || '') })])
        ])
      ])
    ]);
  }

  var current = 'all';
  function render(key, animate) {
    current = key;
    grid.textContent = '';
    var shown = projects.filter(function (p) { return matches(p, key); });
    shown.forEach(function (p, i) {
      var item = card(p, i);
      if (animate && !reduced) {
        item.classList.add('is-entering');
        item.style.animationDelay = (i * 45) + 'ms';
      }
      grid.appendChild(item);
    });
    if (!shown.length) grid.appendChild(el('li', { className: 'pf-empty', text: 'No projects in this group yet.' }));
    if (liveRegion) {
      var label = FILTERS.filter(function (f) { return f.key === key; })[0].label;
      liveRegion.textContent = key === 'all'
        ? 'Showing all ' + shown.length + ' projects.'
        : 'Showing ' + shown.length + ' of ' + projects.length + ' projects: ' + label + '.';
    }
  }

  /* ---------- Filters (only groups that actually contain projects) ---------- */
  if (filterBar) {
    FILTERS.forEach(function (f) {
      var n = count(f.key);
      if (!n) return;
      var b = el('button', { type: 'button', className: 'pf-filter', 'aria-pressed': f.key === 'all' ? 'true' : 'false', 'data-filter': f.key }, [
        f.label, el('span', { className: 'c', text: String(n), 'aria-hidden': 'true' })
      ]);
      filterBar.appendChild(b);
    });
    filterBar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      var key = b.getAttribute('data-filter');
      if (key === current) return;
      filterBar.querySelectorAll('[data-filter]').forEach(function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      render(key, true);
      if (window.AltitudeTrack) window.AltitudeTrack('portfolio_filter', { filter: key });
    });
  }
  render('all', false);

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
