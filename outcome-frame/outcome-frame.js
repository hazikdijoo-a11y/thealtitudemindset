/* Outcome Frame tool. Runs entirely in the browser; nothing is sent anywhere. */
(function () {
  'use strict';
  var form = document.getElementById('of-form');
  if (!form) return;

  var KEY = 'altitude_outcome_frame_v1';
  var LABELS = {
    what: 'What I want',
    context: 'Where, when and with whom',
    evidence: 'How I will know I have it',
    control: 'What is in my control',
    resources: 'What I already have',
    cost: 'What it might cost or change',
    step: 'My first step (next 48 hours)'
  };
  var ORDER = ['what', 'context', 'evidence', 'control', 'resources', 'cost', 'step'];
  var MESSAGES = {
    what: 'Write what you want, even in a rough sentence. You can refine it later.',
    evidence: 'Describe one thing you would see, hear or feel when you have it.',
    step: 'Choose one small action you can take in the next 48 hours.'
  };

  var fields = {};
  ORDER.forEach(function (k) { fields[k] = document.getElementById('of-' + k); });
  var countEl = document.getElementById('of-count');
  var barEl = document.getElementById('of-bar-fill');
  var statusEl = document.getElementById('of-status');
  var result = document.getElementById('of-result');
  var list = document.getElementById('of-list');
  var dateEl = document.getElementById('of-date');
  var copyStatus = document.getElementById('of-copy-status');

  function track(name) {
    try { if (window.AltitudeTrack) window.AltitudeTrack(name, { page: location.pathname }); } catch (e) {}
  }
  function read() {
    var o = {};
    ORDER.forEach(function (k) { o[k] = fields[k].value.trim(); });
    return o;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(read())); } catch (e) {}
  }
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (d) ORDER.forEach(function (k) { if (typeof d[k] === 'string') fields[k].value = d[k]; });
    } catch (e) {}
  }
  function updateProgress() {
    var n = ORDER.filter(function (k) { return fields[k].value.trim(); }).length;
    countEl.textContent = n + ' of 7 answered';
    barEl.style.width = (n / 7 * 100) + '%';
  }
  function setError(k, msg) {
    var q = fields[k].closest('.of-q');
    document.getElementById('of-' + k + '-err').textContent = msg || '';
    q.classList.toggle('has-error', !!msg);
    if (msg) fields[k].setAttribute('aria-invalid', 'true'); else fields[k].removeAttribute('aria-invalid');
  }
  function validate() {
    var first = null;
    ORDER.forEach(function (k) {
      var bad = fields[k].hasAttribute('data-required') && !fields[k].value.trim();
      setError(k, bad ? MESSAGES[k] : '');
      if (bad && !first) first = fields[k];
    });
    return first;
  }
  function asText(o) {
    var lines = ['MY OUTCOME FRAME', dateEl.textContent, ''];
    ORDER.forEach(function (k) {
      lines.push(LABELS[k].toUpperCase());
      lines.push(o[k] || '(not answered)');
      lines.push('');
    });
    lines.push('Made with the Outcome Frame tool at thealtitudemindset.com/outcome-frame');
    return lines.join('\n');
  }
  function render(o) {
    list.textContent = '';
    ORDER.forEach(function (k) {
      var wrap = document.createElement('div');
      if (k === 'step') wrap.className = 'is-step';
      if (!o[k]) wrap.className += ' is-empty';
      var dt = document.createElement('dt'); dt.textContent = LABELS[k];
      var dd = document.createElement('dd'); dd.textContent = o[k] || 'Not answered';
      wrap.appendChild(dt); wrap.appendChild(dd); list.appendChild(wrap);
    });
    dateEl.textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  ORDER.forEach(function (k) {
    fields[k].addEventListener('input', function () {
      if (fields[k].value.trim()) setError(k, '');
      updateProgress(); save();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = validate();
    if (bad) {
      statusEl.className = 'form__status is-error';
      statusEl.textContent = 'Please answer the questions marked above so your frame is usable.';
      bad.focus();
      return;
    }
    statusEl.textContent = ''; statusEl.className = 'form__status';
    render(read()); save();
    result.hidden = false;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    result.focus({ preventScroll: true });
    track('outcome_frame_complete');
  });

  document.getElementById('of-clear').addEventListener('click', function () {
    if (!window.confirm('Clear all your answers? This cannot be undone.')) return;
    ORDER.forEach(function (k) { fields[k].value = ''; setError(k, ''); });
    try { localStorage.removeItem(KEY); } catch (e) {}
    result.hidden = true; statusEl.textContent = ''; updateProgress();
    fields.what.focus();
  });

  document.getElementById('of-edit').addEventListener('click', function () {
    form.scrollIntoView({ behavior: 'auto', block: 'start' });
    fields.what.focus({ preventScroll: true });
  });

  document.getElementById('of-print').addEventListener('click', function () {
    track('outcome_frame_print'); window.print();
  });

  document.getElementById('of-copy').addEventListener('click', function () {
    var text = asText(read());
    function done(ok) {
      copyStatus.className = 'form__status ' + (ok ? 'is-ok' : 'is-error');
      copyStatus.textContent = ok ? 'Copied. Paste it into your notes.' : 'Copy failed. Select the text above and copy it manually.';
      if (ok) track('outcome_frame_copy');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done(ok);
    }
  });

  load(); updateProgress();
})();
