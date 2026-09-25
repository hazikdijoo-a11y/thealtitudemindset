/* Website Conversion Checklist: live score. Nothing is stored or sent. */
(function () {
  'use strict';
  var form = document.getElementById('ck-form');
  if (!form) return;
  var boxes = form.querySelectorAll('input[type="checkbox"]');
  var count = document.getElementById('ck-count');
  var bar = document.getElementById('ck-bar');
  var verdict = document.getElementById('ck-verdict');
  var advice = document.getElementById('ck-advice');
  var total = boxes.length;
  var tracked = false;

  function update() {
    var n = Array.prototype.filter.call(boxes, function (b) { return b.checked; }).length;
    count.textContent = n;
    bar.style.width = (n / total * 100) + '%';
    var missing = total - n;
    if (n === 0) {
      verdict.textContent = 'Tick each check that’s true for your website.';
      advice.textContent = 'Every unticked box is a place enquiries can slip away.';
    } else if (n >= 17) {
      verdict.textContent = n + ' of ' + total + ': in good shape.';
      advice.textContent = missing ? 'Fix the last ' + missing + ' and your site is doing its job. An audit can check the details you can’t see yourself.' : 'Your website covers the basics. An audit can look for the next improvements.';
    } else if (n >= 11) {
      verdict.textContent = n + ' of ' + total + ': likely losing some enquiries.';
      advice.textContent = missing + ' checks are open. Start with the ones under “On a phone” and “Getting in touch”, because they cost the most.';
    } else {
      verdict.textContent = n + ' of ' + total + ': your website is probably costing you work.';
      advice.textContent = 'With ' + missing + ' checks open, a focused upgrade or a fresh start will likely do more than small fixes.';
    }
    if (!tracked && n >= 5 && window.AltitudeTrack) { tracked = true; window.AltitudeTrack('checklist_engaged', {}); }
  }
  form.addEventListener('change', update);
  update();

  var print = document.getElementById('ck-print');
  if (print) print.addEventListener('click', function () { window.print(); });
})();
