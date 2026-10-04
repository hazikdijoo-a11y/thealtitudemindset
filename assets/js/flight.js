/* =============================================================
   The Altitude Mindset — "Flight" homepage behaviour
   Vanilla JS, deferred, homepage only. Runs alongside site.js
   (forms, pattern picker, reveals, pay links, data-track clicks).
   Every effect here degrades to a readable static page.
   ============================================================= */
(function () {
  'use strict';

  var doc = document;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var track = function (e, p) { if (window.AltitudeTrack) window.AltitudeTrack(e, p || {}); };
  var $ = function (id) { return doc.getElementById(id); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };

  /* -----------------------------------------------------------
     Counter: eases a number element from its current value.
     ----------------------------------------------------------- */
  function countTo(el, to, opts) {
    if (!el) return;
    opts = opts || {};
    var pad = opts.pad || 0;
    var render = function (v) {
      var s = pad ? String(Math.round(v)).padStart(pad, '0') : fmt(v);
      el.textContent = s;
    };
    var from = parseFloat(el.getAttribute('data-v') || '0');
    el.setAttribute('data-v', to);
    if (reduced || from === to) { render(to); return; }
    var dur = opts.dur || 900, t0 = performance.now();
    cancelAnimationFrame(el._raf);
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      render(from + (to - from) * e);
      if (k < 1) el._raf = requestAnimationFrame(step);
    })(t0);
  }

  /* -----------------------------------------------------------
     Climb progress bar + scroll-depth analytics
     ----------------------------------------------------------- */
  var bar = doc.querySelector('.fx-climbbar');
  var depthMarks = [25, 50, 75, 90], depthSent = {};
  var turb = $('turbulence'), turbSky = turb && turb.querySelector('.fx-turb__sky');
  var ticking = false;
  var phaseSecs = doc.querySelectorAll('section[data-phase]'), lastPhase = null;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var h = doc.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
      if (bar) bar.style.setProperty('--climb', p.toFixed(4));
      depthMarks.forEach(function (m) {
        if (!depthSent[m] && p * 100 >= m) { depthSent[m] = 1; track('scroll_depth', { percent: m }); }
      });
      // Phase = the last journey section whose top has passed mid-screen,
      // so jumping via an anchor lands on the right reading too.
      var current = null;
      for (var i = 0; i < phaseSecs.length; i++) {
        if (phaseSecs[i].getBoundingClientRect().top < innerHeight / 2) current = phaseSecs[i];
      }
      if (current && current !== lastPhase) { lastPhase = current; setPhase(current); }
      // Turbulence: clouds thicken as the section crosses the viewport
      if (turbSky && !reduced) {
        var r = turb.getBoundingClientRect();
        var t = 1 - Math.abs((r.top + r.height / 2) - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
        t = Math.max(0, Math.min(1, t));
        turbSky.style.setProperty('--turb', t.toFixed(3));
        turb.classList.toggle('is-rough', t > .55);
      }
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* -----------------------------------------------------------
     Hero: altitude readout + cursor light (fine pointers only)
     ----------------------------------------------------------- */
  var hero = $('cockpit');
  if (hero && finePointer && !reduced) {
    var light = hero.querySelector('.fx-light');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      light.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      light.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* -----------------------------------------------------------
     Magnetic buttons — a few px of pull toward the cursor, so the
     primary action reads as "live". Desktop pointers only.
     ----------------------------------------------------------- */
  if (finePointer && !reduced) {
    doc.querySelectorAll('.fx-magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (x * 8).toFixed(1) + 'px,' + (y * 6).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* -----------------------------------------------------------
     Section phases: altimeter rail, section-view analytics,
     and "live" classes that start/stop looping animations.
     ----------------------------------------------------------- */
  var rail = doc.querySelector('.fx-rail');
  var railAlt = $('fx-rail-alt');
  var railLinks = rail ? Array.prototype.slice.call(rail.querySelectorAll('a[data-phase]')) : [];
  var phaseOrder = railLinks.map(function (a) { return a.getAttribute('data-phase'); });
  var seen = {};

  function setPhase(sec) {
    var phase = sec.getAttribute('data-phase');
    var alt = parseFloat(sec.getAttribute('data-alt') || '0');
    var idx = phaseOrder.indexOf(phase);
    railLinks.forEach(function (a, i) {
      a.classList.toggle('is-on', i === idx);
      a.classList.toggle('is-past', i < idx);
      if (i === idx) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    countTo(railAlt, alt);
  }

  if ('IntersectionObserver' in window) {
    // Section views (first time ≥40% visible or filling the viewport)
    var viewIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (en.isIntersecting && !seen[id]) { seen[id] = 1; track('section_view', { section: id }); }
      });
    }, { threshold: [0.4] });
    doc.querySelectorAll('main > section[id]').forEach(function (s) { viewIO.observe(s); });


    // Live: loops only run while their section is on screen
    var liveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('is-live', en.isIntersecting); });
    });
    ['ground', 'cruise'].forEach(function (id) { if ($(id)) liveIO.observe($(id)); });

    // Rail appears once the hero has scrolled away
    if (rail && hero) {
      new IntersectionObserver(function (entries) {
        rail.classList.toggle('is-visible', !entries[0].isIntersecting);
      }, { threshold: 0.15 }).observe(hero);
    }

    // One-shot draw-ons
    var drawIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); drawIO.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    doc.querySelectorAll('.fx-neural, .fx-legs').forEach(function (el) { drawIO.observe(el); });

    /* Takeoff: stages light up as they pass the middle; the gauge
       climbs 3,000 → 5,000 → 10,000 ft with them. */
    var stages = doc.querySelectorAll('.fx-stage');
    var takeNum = $('fx-takeoff-num'), takeBar = $('fx-takeoff-bar');
    takeNum && takeNum.setAttribute('data-v', '3000');
    var stageIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        stages.forEach(function (s) { s.classList.toggle('is-on', s === en.target); });
        var ft = parseFloat(en.target.getAttribute('data-ft'));
        countTo(takeNum, ft, { dur: 800 });
        if (takeBar) takeBar.style.setProperty('--to', (ft / 10000).toFixed(2));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    stages.forEach(function (s) { stageIO.observe(s); });
  } else {
    doc.querySelectorAll('.fx-neural, .fx-legs, .fx-stage').forEach(function (el) { el.classList.add('is-in', 'is-on'); });
  }

  onScroll();

  /* -----------------------------------------------------------
     Nav clicks (header, drawer, rail) → analytics
     ----------------------------------------------------------- */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('.nav__menu a, .nav__drawer a, .fx-rail a, .nav__logo');
    if (!a || a.hasAttribute('data-track')) return;
    track('nav_click', {
      link_text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 60),
      link_url: a.getAttribute('href') || '',
      nav: a.closest('.fx-rail') ? 'rail' : a.closest('.nav__drawer') ? 'drawer' : 'header'
    });
  });

  /* Form starts: first interaction with each lead form */
  ['contact-form', 'magnet-form'].forEach(function (id) {
    var f = $(id);
    if (!f) return;
    f.addEventListener('focusin', function once() {
      f.removeEventListener('focusin', once);
      track('form_start', { form_id: id });
    });
  });

  /* -----------------------------------------------------------
     Generic single-select control (instruments, waypoints)
     ----------------------------------------------------------- */
  function selector(buttons, onSelect) {
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { choose(i, true); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = buttons.length, j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % n;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + n) % n;
        else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
        if (j < 0) return;
        e.preventDefault(); buttons[j].focus(); choose(j, true);
      });
    });
    function choose(i, user) {
      buttons.forEach(function (b, j) {
        b.classList.toggle('is-on', i === j);
        b.setAttribute('aria-pressed', i === j ? 'true' : 'false');
      });
      onSelect(i, user);
    }
    return choose;
  }
  function swap(el) {
    if (!el || reduced) return;
    el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap');
  }

  /* Text scramble — used only on the two short readouts that change
     when a visitor makes a choice, so the change is noticed. */
  var GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  function scramble(el, text) {
    if (!el) return;
    if (reduced) { el.textContent = text; return; }
    var frame = 0, total = 14;
    cancelAnimationFrame(el._scr);
    (function step() {
      var out = '';
      for (var i = 0; i < text.length; i++) {
        var reveal = (i / text.length) * total * 0.7;
        out += (frame >= reveal + 4 || text[i] === ' ' || text[i] === '·') ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (++frame <= total + 4) el._scr = requestAnimationFrame(step); else el.textContent = text;
    })();
  }

  /* -----------------------------------------------------------
     05 Cruise — instruments
     ----------------------------------------------------------- */
  var INSTRUMENTS = [
    ['Beliefs', 'The beliefs you carry influence the decisions you make.',
      'Most were true once. Coaching finds the ones that aren’t any more, and tests them against who you are now.'],
    ['Confidence', 'Confidence decides which risks you’re willing to take.',
      'Real confidence isn’t the absence of doubt. It’s a state you can return to, built on evidence you can point at.'],
    ['Emotions', 'Emotions decide how you react when things go wrong.',
      'Learning to recognise and shift your state means you respond to the situation, not to the spike.'],
    ['Relationships', 'Relationships reflect the patterns you bring into them.',
      'The argument you keep having is usually a pattern, not a person. Change your side of it and the exchange changes.'],
    ['Decisions', 'Decisions set the heading for everything that follows.',
      'Clarity comes from knowing what you value and what you’re afraid of, and not letting the second one choose.'],
    ['Habits', 'Habits are your autopilot.',
      'They fly the plane when you’re not paying attention. Coaching resets the autopilot so it flies where you meant to go.']
  ];
  var insts = Array.prototype.slice.call(doc.querySelectorAll('.fx-inst'));
  if (insts.length) {
    var panel = $('fx-readpanel');
    selector(insts, function (i, user) {
      var d = INSTRUMENTS[i];
      scramble($('fx-inst-k'), 'Instrument · ' + d[0]);
      $('fx-inst-t').textContent = d[1];
      $('fx-inst-d').textContent = d[2];
      swap(panel);
      if (user) track('instrument_select', { instrument: d[0].toLowerCase() });
    });
  }

  /* -----------------------------------------------------------
     07 Navigation — waypoints
     ----------------------------------------------------------- */
  var WAYPOINTS = [
    ['Awareness', 'You notice that something keeps repeating.',
      'Blaming the situation and missing the pattern underneath it.',
      'Name the specific trigger and the belief sitting under the reaction.',
      'You can see the pattern while it is happening, not only afterwards.'],
    ['Belief', 'You hold a conclusion about yourself or the world, usually formed years ago.',
      'Treating an old conclusion as a fact about who you are.',
      'Test the belief: where it came from, what it protects, whether it’s still true.',
      'A belief chosen on purpose, one that fits who you are now.'],
    ['Thought', 'The belief shows up as fast, automatic self-talk.',
      'Overthinking: replaying, predicting, rehearsing the worst case.',
      'Notice the exact words and tone of the inner voice, then change how it speaks to you.',
      'Thinking that helps you decide, instead of keeping you stuck.'],
    ['Emotion', 'Your body responds to the thought before you’ve chosen anything.',
      'Reacting first, then reviewing it all evening.',
      'Build a reliable way to change your state when it matters.',
      'You feel it fully and still choose your response.'],
    ['Action', 'You do something, or you avoid doing it.',
      'Knowing exactly what to do and still not doing it.',
      'Find what the avoidance is protecting, then design a step small enough to take.',
      'Action that matches what you intend.'],
    ['Result', 'The world responds to what you did.',
      'Reading one result as proof that the old belief was right.',
      'Review results as feedback, without turning them into a verdict.',
      'Results become information you can steer by.'],
    ['Identity', 'Repeated results harden into “this is who I am”.',
      '“I’m just not a confident person.”',
      'Separate who you are from what you’ve been doing.',
      'An identity you would actually choose.'],
    ['Transformation', 'The new pattern starts running on its own.',
      'Expecting change to be one big moment instead of many small ones.',
      'Rehearse the new pattern in the real situations that matter to you.',
      'Change that holds when it’s tested.']
  ];
  var wps = Array.prototype.slice.call(doc.querySelectorAll('.fx-wp'));
  if (wps.length) {
    var route = doc.querySelector('.fx-route');
    var detail = doc.querySelector('.fx-wpdetail');
    selector(wps, function (i, user) {
      var d = WAYPOINTS[i];
      wps.forEach(function (b, j) { b.classList.toggle('is-past', j < i); });
      route.style.setProperty('--wp-p', (i / (wps.length - 1)).toFixed(3));
      $('fx-wp-n').textContent = 'WPT ' + String(i + 1).padStart(2, '0');
      scramble($('fx-wp-name'), d[0]);
      $('fx-wp-a').textContent = d[1];
      $('fx-wp-b').textContent = d[2];
      $('fx-wp-c').textContent = d[3];
      $('fx-wp-d').textContent = d[4];
      swap(detail);
      if (user) track('waypoint_select', { waypoint: d[0].toLowerCase() });
    });
  }

  /* -----------------------------------------------------------
     Altitude check — six statements, 1–5. A reflection, not a
     diagnosis: nothing is stored or sent except two analytics
     events (start, complete) with no answers attached.
     ----------------------------------------------------------- */
  var QUESTIONS = [
    ['Confidence', 'I trust myself to handle the situations that matter, even under pressure.'],
    ['Limiting beliefs', 'The beliefs I hold about myself help me more than they hold me back.'],
    ['Relationships', 'I can say what I really mean in my close relationships without it turning into conflict.'],
    ['Direction', 'I have a clear sense of where my life is heading next.'],
    ['Emotional control', 'When something upsets me, I can respond rather than react.'],
    ['Self-belief', 'I believe I deserve the things I’m working towards.']
  ];
  var SCALE = ['Rarely true', 'Sometimes', 'About half the time', 'Often', 'Almost always'];

  var qStart = $('fx-quiz-start');
  if (qStart) {
    var qIntro = $('fx-quiz-intro'), qForm = $('fx-quiz-form'), qResult = $('fx-quiz-result');
    var qBox = $('fx-quiz-q'), qStep = $('fx-quiz-step'), qBar = $('fx-quiz-bar');
    var qNext = $('fx-quiz-next'), qBack = $('fx-quiz-back');
    var answers = [], cur = 0;

    function renderQ() {
      var q = QUESTIONS[cur];
      var html = '<fieldset><legend><span class="fx-quiz__cat">' + q[0] + '</span><span class="fx-quiz__qt">' + q[1] + '</span></legend><div class="fx-scale">';
      SCALE.forEach(function (label, i) {
        var v = i + 1;
        html += '<label><input type="radio" name="q' + cur + '" value="' + v + '"' + (answers[cur] === v ? ' checked' : '') +
          ' /><span><b>' + v + '</b>' + label + '</span></label>';
      });
      qBox.innerHTML = html + '</div></fieldset>';
      qStep.textContent = 'Question ' + (cur + 1) + ' of ' + QUESTIONS.length;
      qBar.style.width = (cur / QUESTIONS.length * 100) + '%';
      qNext.disabled = !answers[cur];
      qNext.textContent = cur === QUESTIONS.length - 1 ? 'See my altitude' : 'Next';
      qBack.disabled = cur === 0;
    }
    qBox.addEventListener('change', function (e) {
      if (e.target.name !== 'q' + cur) return;
      answers[cur] = parseInt(e.target.value, 10);
      qNext.disabled = false;
    });
    qStart.addEventListener('click', function () {
      answers = []; cur = 0;
      qIntro.hidden = true; qResult.hidden = true; qForm.hidden = false;
      renderQ();
      var first = qBox.querySelector('input'); first && first.focus();
      track('assessment_start', {});
    });
    qBack.addEventListener('click', function () {
      if (cur > 0) { cur--; renderQ(); var c = qBox.querySelector('input:checked') || qBox.querySelector('input'); c && c.focus(); }
    });
    qForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!answers[cur]) return;
      if (cur < QUESTIONS.length - 1) {
        cur++; renderQ();
        var c = qBox.querySelector('input:checked') || qBox.querySelector('input'); c && c.focus();
        return;
      }
      showResult();
    });
    $('fx-quiz-retake').addEventListener('click', function () { qStart.click(); });

    function showResult() {
      var sum = answers.reduce(function (a, b) { return a + b; }, 0);
      // 6 → 1,000 ft · 30 → 41,000 ft, in steps of 100 ft
      var alt = Math.round((1000 + (sum - 6) / 24 * 40000) / 100) * 100;
      var band, msg;
      if (alt < 12000) {
        band = 'Still on the climb-out';
        msg = 'Something is weighing on the climb right now. That isn’t a verdict on you. It’s useful information about where to start.';
      } else if (alt < 28000) {
        band = 'Climbing';
        msg = 'You’re airborne, with a few instruments pulling you back down. Small, specific shifts make the biggest difference at this stage.';
      } else {
        band = 'Near cruising altitude';
        msg = 'Most of your instruments are reading well. The next altitude usually comes from one specific pattern that still costs you.';
      }
      var min = Math.min.apply(null, answers), max = Math.max.apply(null, answers);
      var lows = QUESTIONS.filter(function (q, i) { return answers[i] === min; }).map(function (q) { return q[0].toLowerCase(); });
      var lowText = min === max
        ? 'Your six instruments are reading evenly today.'
        : 'Lowest reading today: <b>' + lows.join(', ') + '</b>. That’s usually the most useful place to begin.';

      qForm.hidden = true; qResult.hidden = false;
      $('fx-quiz-band').textContent = band;
      $('fx-quiz-msg').textContent = msg;
      $('fx-quiz-low').innerHTML = lowText;
      var altEl = $('fx-quiz-alt');
      altEl.setAttribute('data-v', '0');
      countTo(altEl, alt, { dur: 1400 });
      qResult.focus({ preventScroll: true });
      var top = qResult.closest('.fx-quiz').getBoundingClientRect().top;
      if (top < 80 || top > innerHeight * .6) {
        scrollTo({ top: scrollY + top - 100, behavior: reduced ? 'auto' : 'smooth' });
      }
      track('assessment_complete', { altitude_band: band.toLowerCase().replace(/\s+/g, '_') });
    }
  }
})();
