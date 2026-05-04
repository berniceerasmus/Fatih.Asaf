/* ============================================================
   shared-lesson.js  —  Melinda Metin English Course
   - Working accordion toggle
   - Per-exercise scoring with live score bar
   - Progress bar tracking
   ============================================================ */
(function(){
'use strict';

/* ── State ─────────────────────────────────────────────────── */
var totalQuestions = 0;   // all data-answer inputs on page
var correctCount   = 0;   // running tally of correct answers
var sectionsDone   = 0;   // for progress bar
var totalSections  = 0;

/* ── Accordion ─────────────────────────────────────────────── */
function initAccordions(){
  var btns = document.querySelectorAll('.accordion');
  totalSections = btns.length;
  updateProgress();

  btns.forEach(function(btn){
    var panel = btn.nextElementSibling;
    if(!panel || !panel.classList.contains('panel')) return;

    btn.addEventListener('click', function(){
      var isOpen = panel.classList.contains('open');
      // close all
      document.querySelectorAll('.panel.open').forEach(function(p){
        p.classList.remove('open');
      });
      // open this one if it was closed
      if(!isOpen){
        panel.classList.add('open');
        setTimeout(function(){
          btn.scrollIntoView({behavior:'smooth', block:'nearest'});
        }, 60);
      }
    });
  });
}

/* ── Progress bar ──────────────────────────────────────────── */
function updateProgress(){
  var bar  = document.getElementById('lessonSteps');
  var pct  = document.getElementById('lessonPct');
  if(!bar || !pct) return;

  var steps = bar.querySelectorAll('.step');
  var done  = sectionsDone;
  steps.forEach(function(s,i){
    s.classList.remove('done','active');
    if(i < done)          s.classList.add('done');
    else if(i === done)   s.classList.add('active');
  });
  var p = totalSections > 0 ? Math.round(done/totalSections*100) : 0;
  pct.textContent = p + '%';
}

/* ── Score bar ─────────────────────────────────────────────── */
function updateScore(){
  var numEl   = document.getElementById('scoreNum');
  var denEl   = document.getElementById('scoreDen');
  var starEl  = document.getElementById('scoreStars');
  if(!numEl) return;

  numEl.textContent = correctCount;
  if(denEl) denEl.textContent = '/' + totalQuestions;

  var pct = totalQuestions > 0 ? correctCount/totalQuestions : 0;
  var stars = pct >= 0.9 ? '🌟🌟🌟' : pct >= 0.7 ? '⭐⭐' : pct >= 0.4 ? '⭐' : '';
  if(starEl) starEl.textContent = stars;
}

/* ── Count all checkable inputs on page ────────────────────── */
function countQuestions(){
  totalQuestions = document.querySelectorAll('input[type="text"][data-answer]').length;
  updateScore();
}

/* ── Normalise ─────────────────────────────────────────────── */
function norm(s){
  return (s||'').toLowerCase().trim().replace(/['']/g,"'").replace(/\s+/g,' ');
}

/* ── Show result on one input ──────────────────────────────── */
function applyResult(input, correct){
  // Remove old feedback
  var prev = input.parentNode.querySelector('.feedback-msg[data-for="'+input.id+'"]');
  if(prev) prev.remove();

  var wasCorrect = input.classList.contains('correct');
  var wasIncorrect = input.classList.contains('incorrect');

  // Update global tally
  if(correct && !wasCorrect){
    correctCount++;
    if(wasIncorrect) correctCount = Math.max(0, correctCount); // already counted wrong, now right
  } else if(!correct && wasCorrect){
    correctCount = Math.max(0, correctCount - 1);
  }

  input.classList.toggle('correct',   correct);
  input.classList.toggle('incorrect', !correct);

  var span = document.createElement('span');
  span.className = 'feedback-msg ' + (correct ? 'ok' : 'bad');
  span.dataset.for = input.id;
  span.textContent = correct ? '✓' : '✗ ' + input.dataset.answer;
  input.insertAdjacentElement('afterend', span);

  updateScore();
}

/* ── Public: checkById ─────────────────────────────────────── */
window.checkById = function(id){
  var el = document.getElementById(id);
  if(!el) return;
  var wasAnswered = el.classList.contains('correct') || el.classList.contains('incorrect');
  var correct = norm(el.value) === norm(el.dataset.answer);

  // adjust tally carefully
  if(!wasAnswered){
    if(correct) correctCount++;
  } else {
    var wasRight = el.classList.contains('correct');
    if(correct && !wasRight)  correctCount++;
    if(!correct && wasRight)  correctCount = Math.max(0, correctCount-1);
  }

  el.classList.toggle('correct',   correct);
  el.classList.toggle('incorrect', !correct);

  var prev = el.parentNode.querySelector('.feedback-msg[data-for="'+id+'"]');
  if(prev) prev.remove();
  var span = document.createElement('span');
  span.className = 'feedback-msg ' + (correct ? 'ok' : 'bad');
  span.dataset.for = id;
  span.textContent = correct ? '✓' : '✗ ' + el.dataset.answer;
  el.insertAdjacentElement('afterend', span);

  // mark section done
  markSectionDone(el);
  updateScore();
};

/* ── Public: checkAll ──────────────────────────────────────── */
window.checkAll = function(cardId){
  var card = document.getElementById(cardId);
  if(!card) return;
  card.querySelectorAll('input[type="text"][data-answer]').forEach(function(el){
    var wasRight = el.classList.contains('correct');
    var wasWrong = el.classList.contains('incorrect');
    var correct  = norm(el.value) === norm(el.dataset.answer);

    if(!wasRight && !wasWrong){
      if(correct) correctCount++;
    } else {
      if(correct && !wasRight)  correctCount++;
      if(!correct && wasRight)  correctCount = Math.max(0, correctCount-1);
    }

    el.classList.toggle('correct',   correct);
    el.classList.toggle('incorrect', !correct);

    var prev = el.parentNode.querySelector('.feedback-msg[data-for="'+el.id+'"]');
    if(prev) prev.remove();
    var span = document.createElement('span');
    span.className = 'feedback-msg ' + (correct ? 'ok' : 'bad');
    span.dataset.for = el.id || '';
    span.textContent = correct ? '✓' : '✗ ' + el.dataset.answer;
    el.insertAdjacentElement('afterend', span);
  });

  markSectionDone(card);
  updateScore();
};

/* ── Mark section as done when any answer checked ─────────── */
function markSectionDone(el){
  // Walk up to find the .panel, then find its .accordion sibling
  var panel = el.closest ? el.closest('.panel') : null;
  if(!panel) return;
  // Count answered inputs in this panel
  var inputs  = panel.querySelectorAll('input[type="text"][data-answer]');
  var answered = panel.querySelectorAll('input[type="text"].correct, input[type="text"].incorrect');
  if(inputs.length > 0 && answered.length === inputs.length){
    // All answered — count this section
    var allPanels = document.querySelectorAll('.panel');
    var done = 0;
    allPanels.forEach(function(p){
      var ins = p.querySelectorAll('input[type="text"][data-answer]');
      var ans = p.querySelectorAll('input[type="text"].correct,input[type="text"].incorrect');
      if(ins.length > 0 && ans.length >= ins.length) done++;
      // sections with no inputs (writing/speaking) count when panel is opened
    });
    sectionsDone = done;
    updateProgress();
  }
}

/* ── Track open panels for sections with no checkable inputs ─ */
function trackOpenSections(){
  document.querySelectorAll('.accordion').forEach(function(btn){
    btn.addEventListener('click', function(){
      // slight delay so panel state has toggled
      setTimeout(function(){
        var done = 0;
        document.querySelectorAll('.panel').forEach(function(p){
          var ins = p.querySelectorAll('input[type="text"][data-answer]');
          var ans = p.querySelectorAll('input[type="text"].correct,input[type="text"].incorrect');
          // has checkable inputs → only done when answered
          if(ins.length > 0){
            if(ans.length >= ins.length) done++;
          } else {
            // writing/speaking/grammar: done when ever opened
            if(p.classList.contains('open')) done++;
          }
        });
        sectionsDone = Math.max(sectionsDone, done);
        updateProgress();
      }, 80);
    });
  });
}

/* ── Boot ──────────────────────────────────────────────────── */
function boot(){
  initAccordions();
  trackOpenSections();
  countQuestions();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

}());
