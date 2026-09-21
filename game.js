(() => {
  'use strict';
  const section = document.querySelector('#play');
  if (!section) return;
  const $ = selector => section.querySelector(selector);
  const board = $('#game-board'), player = $('#game-player'), tokens = $('#game-tokens');
  const overlay = $('#game-overlay'), start = $('#game-start'), pauseButton = $('#game-pause');
  const modeSelect = $('#game-mode'), laneButtons = [...section.querySelectorAll('[data-game-lane]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const GOAL = 12, ROUND_SECONDS = 30, CATCH_Y = .82;
  let phase = 'idle', mode = reduced.matches ? 'relaxed' : 'classic';
  let lane = 1, score = 0, ideas = 0, lives = 3, streak = 0, elapsed = 0, spawnIn = .4;
  let objects = [], raf = null, previousTime = 0, reactionUntil = 0, boardHeight = board.clientHeight;
  let best = { classic: 0, relaxed: 0 };
  try {
    const stored = JSON.parse(localStorage.getItem('pranav-launch-sprint-best') || '{}');
    for (const key of Object.keys(best)) if (Number.isSafeInteger(stored?.[key]) && stored[key] >= 0 && stored[key] <= 100000) best[key] = stored[key];
  } catch { /* A round also works when browser storage is unavailable. */ }
  modeSelect.value = mode;
  function announce(message) { $('#game-feedback').textContent = message; }
  function scoreboard() {
    $('#game-score').textContent = String(score).padStart(3, '0');
    $('#game-ideas').textContent = ideas;
    $('#game-time-label').textContent = mode === 'relaxed' ? 'Pace' : 'Time';
    $('#game-time').textContent = mode === 'relaxed' ? 'Easy' : `${Math.max(0, Math.ceil(ROUND_SECONDS - elapsed))}s`;
    $('#game-lives').firstElementChild.textContent = Array.from({ length: 3 }, (_, i) => i < lives ? '♥' : '♡').join(' ');
    $('#game-lives').setAttribute('aria-label', `${lives} ${lives === 1 ? 'life' : 'lives'}`);
    $('#game-best').textContent = String(best[mode]).padStart(3, '0');
    section.style.setProperty('--game-progress', `${Math.min(100, ideas / GOAL * 100)}%`);
  }
  function setPhase(next) {
    phase = next; board.dataset.state = phase;
    document.body.classList.toggle('game-playing', phase === 'running');
    overlay.hidden = phase === 'running';
    pauseButton.disabled = !['running', 'paused'].includes(phase);
    pauseButton.textContent = phase === 'paused' ? 'Resume ▷' : 'Pause Ⅱ';
    modeSelect.disabled = ['running', 'paused'].includes(phase);
    laneButtons.forEach(button => { button.disabled = phase !== 'running'; });
    $('#game-reset').hidden = phase !== 'paused';
  }
  function move(next) {
    lane = Math.max(0, Math.min(2, next));
    player.style.left = `${(lane + .5) / 3 * 100}%`;
    laneButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.gameLane) === lane)));
    board.setAttribute('aria-label', `Launch Sprint play area. ${['Left', 'Middle', 'Right'][lane]} lane selected.`);
  }
  function stopLoop() { if (raf !== null) cancelAnimationFrame(raf); raf = null; }
  function reset() {
    stopLoop(); objects = []; tokens.replaceChildren(); score = 0; ideas = 0; lives = 3; streak = 0;
    elapsed = 0; spawnIn = .4; reactionUntil = 0; delete player.dataset.reaction;
    setPhase('idle'); move(1); scoreboard();
    $('#game-overlay-kicker').textContent = mode === 'classic' ? '30 SECONDS TO LAUNCH' : 'YOUR PACE. YOUR NEXT IDEA.';
    $('#game-overlay-title').textContent = 'Ready, product builder?';
    $('#game-overlay-text').textContent = mode === 'classic' ? 'Collect 12 ideas in 30 seconds. Avoid the bugs. You have three lives to make it happen.' : 'Slower ideas, no countdown. Collect 12 ideas and avoid the bugs. You still have three lives.';
    start.innerHTML = 'Let’s play <span aria-hidden="true">↗</span>';
    announce(mode === 'classic' ? 'Your next great idea is one lane away.' : 'Relaxed mode: slower movement and no time limit.');
  }
  function begin() {
    if (document.querySelector('dialog[open]')) return;
    if (phase === 'paused') return resume();
    reset();
    // Keep the chosen narration and game from competing for attention.
    window.dispatchEvent(new Event('portfolio:quiet'));
    setPhase('running'); previousTime = performance.now(); board.focus({ preventScroll: true });
    announce('Go! Catch the star-shaped ideas. Avoid the coral bugs.');
    raf = requestAnimationFrame(tick);
  }
  function pause(message = 'Take a breath. Your sprint will wait.', focus = false) {
    if (phase !== 'running') return;
    stopLoop(); setPhase('paused');
    $('#game-overlay-kicker').textContent = 'PROGRESS SAVED FOR THIS ROUND';
    $('#game-overlay-title').textContent = 'A quick breather.';
    $('#game-overlay-text').textContent = message;
    start.innerHTML = 'Keep going <span aria-hidden="true">▷</span>';
    announce('Game paused. Your score and remaining time are unchanged.');
    if (focus) start.focus({ preventScroll: true });
  }
  function resume() {
    if (document.hidden || document.querySelector('dialog[open]')) return;
    window.dispatchEvent(new Event('portfolio:quiet'));
    setPhase('running'); previousTime = performance.now(); board.focus({ preventScroll: true });
    announce('Back to it! Catch ideas and dodge bugs.'); raf = requestAnimationFrame(tick);
  }
  function finish() {
    stopLoop(); objects = []; tokens.replaceChildren(); setPhase('finished');
    const launched = ideas >= GOAL && lives > 0;
    const record = score > best[mode];
    let saved = true;
    if (record) {
      best[mode] = score;
      try { localStorage.setItem('pranav-launch-sprint-best', JSON.stringify(best)); } catch { saved = false; }
    }
    player.dataset.reaction = launched ? 'win' : 'hit';
    $('#game-overlay-kicker').textContent = record ? 'A NEW PERSONAL BEST' : 'SPRINT COMPLETE';
    $('#game-overlay-title').textContent = launched ? 'That’s a launch!' : lives === 0 ? 'Bugs happen.' : 'One more iteration?';
    $('#game-overlay-text').textContent = `${ideas} ideas. ${score} points. ${launched ? 'A little focus goes a long way.' : 'Try another sprint and bring 12 ideas across the finish line.'}`;
    start.innerHTML = 'Play again <span aria-hidden="true">↗</span>';
    scoreboard();
    announce(`${launched ? 'Product launched!' : 'Round finished.'} ${score} points, ${ideas} ideas collected.${record ? saved ? ' New best saved in this browser.' : ' New best for this visit; browser storage is unavailable.' : ''}`);
    if (board === document.activeElement || laneButtons.includes(document.activeElement)) start.focus({ preventScroll: true });
  }
  function spawn() {
    const ideaLane = Math.floor(Math.random() * 3);
    const bugLane = (ideaLane + 1 + Math.floor(Math.random() * 2)) % 3;
    for (const [kind, itemLane] of [['idea', ideaLane], ['bug', bugLane]]) {
      const node = document.createElement('span'); node.className = `game-token game-token-${kind}`;
      node.dataset.kind = kind; node.dataset.lane = itemLane;
      node.textContent = kind === 'idea' ? '✦' : '×'; node.style.left = `${(itemLane + .5) / 3 * 100}%`;
      tokens.append(node); objects.push({ kind, lane: itemLane, y: -.08, node });
    }
  }
  function resolve(item) {
    if (item.lane !== lane) { if (item.kind === 'idea') streak = 0; return; }
    reactionUntil = elapsed + .32;
    if (item.kind === 'idea') {
      ideas++; score += 10; streak++; player.dataset.reaction = 'catch';
      if (streak % 5 === 0) { score += 20; announce(`${streak} ideas in a row! Twenty bonus points. Score: ${score}.`); }
    } else {
      lives--; streak = 0; player.dataset.reaction = 'hit';
      announce(`Bug caught. ${lives} ${lives === 1 ? 'life' : 'lives'} left. Switch lanes for the next idea.`);
    }
  }
  function tick(now) {
    raf = null;
    if (phase !== 'running') return;
    const dt = Math.min(.08, Math.max(0, (now - previousTime) / 1000)); previousTime = now;
    elapsed += dt; spawnIn -= dt;
    if (spawnIn <= 0) { spawn(); spawnIn += mode === 'relaxed' ? 1.55 : Math.max(.75, 1.15 - elapsed * .012); }
    const speed = mode === 'relaxed' ? .19 : .27 + Math.min(elapsed, ROUND_SECONDS) * .0035;
    for (const item of objects) {
      item.y += dt * speed;
      if (item.y >= CATCH_Y) { resolve(item); item.node.remove(); item.done = true; }
      else item.node.style.transform = `translate(-50%, ${item.y * boardHeight - 17}px)`;
    }
    objects = objects.filter(item => !item.done);
    if (elapsed >= reactionUntil) delete player.dataset.reaction;
    scoreboard();
    if (lives <= 0 || (mode === 'classic' && elapsed >= ROUND_SECONDS) || (mode === 'relaxed' && ideas >= GOAL)) finish();
    else raf = requestAnimationFrame(tick);
  }
  start.addEventListener('click', begin);
  pauseButton.addEventListener('click', () => phase === 'paused' ? resume() : pause(undefined, true));
  $('#game-reset').addEventListener('click', () => { reset(); start.focus({ preventScroll: true }); });
  modeSelect.addEventListener('change', () => { mode = modeSelect.value; reset(); });
  laneButtons.forEach(button => button.addEventListener('click', () => { if (phase === 'running') move(Number(button.dataset.gameLane)); }));
  board.addEventListener('pointerdown', event => {
    if (phase !== 'running' || event.button !== 0 || event.target.closest('button')) return;
    const rect = board.getBoundingClientRect(); move(Math.floor((event.clientX - rect.left) / rect.width * 3));
    board.focus({ preventScroll: true });
  });
  section.addEventListener('keydown', event => {
    if (event.target.closest('input, select, textarea') || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (['p', 'escape'].includes(key) && ['running', 'paused'].includes(phase)) {
      event.preventDefault(); if (phase === 'running') pause(undefined, true); else if (key === 'p') resume(); return;
    }
    if (phase !== 'running') return;
    if (['arrowleft', 'a', 'arrowright', 'd'].includes(key)) { event.preventDefault(); move(lane + (['arrowleft', 'a'].includes(key) ? -1 : 1)); }
  });
  window.addEventListener('blur', () => pause('Paused while you’re away. Pick up where you left off.'));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause('Paused while you’re away. Pick up where you left off.'); });
  section.addEventListener('focusout', () => { setTimeout(() => { if (!section.contains(document.activeElement)) pause('Explore the portfolio. Your sprint will be here when you return.'); }, 0); });
  window.addEventListener('portfolio:quiet', () => pause('Your sprint is paused while you explore.'));
  window.addEventListener('portfolio:project-open', () => pause('Your sprint is paused while you explore a project.'));
  window.addEventListener('pagehide', () => pause());
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (entries[0].intersectionRatio < .25) pause('Paused while the game is out of view.'); }, { threshold: .25 }).observe(board);
  if ('ResizeObserver' in window) new ResizeObserver(() => { boardHeight = board.clientHeight; }).observe(board);
  else window.addEventListener('resize', () => { boardHeight = board.clientHeight; });
  const dialogObserver = new MutationObserver(() => { if (document.querySelector('dialog[open]')) pause('Your sprint is paused while you explore.'); });
  document.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  let motionPaused = document.documentElement.classList.contains('paused');
  new MutationObserver(() => {
    const next = document.documentElement.classList.contains('paused');
    if (next && !motionPaused) pause('Motion paused. Resume when you’re ready to play.'); motionPaused = next;
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  reduced.addEventListener('change', () => { if (phase === 'running') pause('Motion preference changed. Take a break or choose Relaxed for a slower game.'); });
  reset();
})();
