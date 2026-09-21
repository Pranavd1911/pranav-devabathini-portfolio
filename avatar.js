(() => {
  'use strict';

  const companion = document.querySelector('#avatar-companion');
  const dragButton = document.querySelector('#avatar-drag');
  const bubble = document.querySelector('#avatar-message');
  const greeting = document.querySelector('#avatar-greeting');
  const dismissButton = document.querySelector('#avatar-dismiss');
  const restoreButton = document.querySelector('#avatar-restore');
  const portrait = document.querySelector('#portrait');
  const stage = document.querySelector('#avatar-stage');
  const stageCharacter = document.querySelector('#stage-character');
  const gestureButtons = [...document.querySelectorAll('[data-gesture]')];
  const gestureMessages = { wave: 'Hey there! Great to see you.', thumbs: 'Good ideas deserve a thumbs-up.', think: 'Thinking about the next big idea…', celebrate: 'A little win is worth celebrating!', dance: 'A little rhythm between product briefs.' };
  if (!companion || !dragButton || !bubble || !greeting || !dismissButton || !restoreButton) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controllers = new AbortController();
  const options = { signal: controllers.signal };
  const art = [...document.querySelectorAll('.avatar-art')];
  const greetings = [
    'Hey, I’m Pranav! I turn curious ideas into useful products. Take a look around.',
    'Curious about my work? Explore my AI projects, or say hello. I’d love to connect.',
    'A little about me: product thinking, AI, and a love for building things with people.'
  ];
  let greetingIndex = 0;
  let waveTimer;
  let frame;
  let drag;
  let position;
  let suppressedClickUntil = 0;
  let lastPointer;

  const motionAllowed = () => !reducedMotion.matches && !root.classList.contains('paused');
  const clamp = (number, min, max) => Math.min(Math.max(number, min), Math.max(min, max));
  const viewport = () => ({
    left: window.visualViewport?.offsetLeft || 0,
    top: window.visualViewport?.offsetTop || 0,
    width: window.visualViewport?.width || window.innerWidth,
    height: window.visualViewport?.height || window.innerHeight
  });

  function positionBubble() {
    if (bubble.hidden || companion.hidden) return;
    const bounds = companion.getBoundingClientRect();
    const messageBounds = bubble.getBoundingClientRect();
    const view = viewport();
    const x = clamp(bounds.left + bounds.width / 2 - messageBounds.width / 2, view.left + 12, view.left + view.width - messageBounds.width - 12);
    const above = bounds.top - messageBounds.height - 12;
    const y = above >= view.top + 12 ? above : bounds.bottom + 12;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${clamp(y, view.top + 12, view.top + view.height - messageBounds.height - 12)}px`;
  }

  function moveTo(x, y) {
    const view = viewport();
    const bounds = companion.getBoundingClientRect();
    position = {
      x: clamp(x, view.left + 12, view.left + view.width - bounds.width - 12),
      y: clamp(y, view.top + 12, view.top + view.height - bounds.height - 12)
    };
    companion.style.left = `${position.x}px`;
    companion.style.top = `${position.y}px`;
    companion.style.right = 'auto';
    companion.style.bottom = 'auto';
    positionBubble();
  }

  function resetPosition() {
    position = undefined;
    ['left', 'top', 'right', 'bottom'].forEach(property => companion.style.removeProperty(property));
    const bounds = companion.getBoundingClientRect();
    moveTo(bounds.left, bounds.top);
  }

  function closeBubble() {
    bubble.hidden = true;
    dragButton.setAttribute('aria-expanded', 'false');
  }

  function stopWave() {
    window.clearTimeout(waveTimer);
    companion.classList.remove('is-waving');
    portrait?.classList.remove('is-waving');
    stageCharacter?.classList.remove('is-waving');
    art.forEach(element => element.removeAttribute('data-gesture'));
    gestureButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  }

  function playGesture(name, speak = true) {
    if (!Object.hasOwn(gestureMessages, name)) return;
    stopWave();
    // Restart one-shot animation when the same gesture is chosen twice.
    void portrait.offsetWidth;
    if (name === 'wave') {
      companion.classList.add('is-waving');
      portrait?.classList.add('is-waving');
      stageCharacter?.classList.add('is-waving');
    } else art.forEach(element => element.dataset.gesture = name);
    gestureButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gesture === name)));
    document.querySelector('#gesture-status').textContent = gestureMessages[name];
    document.querySelector('#stage-status').textContent = gestureMessages[name];
    waveTimer = window.setTimeout(stopWave, name === 'wave' ? 1800 : name === 'dance' ? 4200 : 3200);
    if (speak) window.dispatchEvent(new CustomEvent('avatar:say', { detail: { clip: name } }));
  }
  function wave(speak = true) { playGesture('wave', speak !== false); }
  gestureButtons.forEach(button => button.addEventListener('click', () => playGesture(button.dataset.gesture)));
  stageCharacter.addEventListener('click', wave);
  function gestureKeys(event) {
    const names = ['wave', 'thumbs', 'think', 'celebrate', 'dance'];
    const name = names[Number(event.key) - 1];
    if (name) { event.preventDefault(); playGesture(name); }
  }
  portrait.addEventListener('keydown', gestureKeys);
  dragButton.addEventListener('keydown', gestureKeys);
  stageCharacter.addEventListener('keydown', gestureKeys);
  const stageMotion = document.querySelector('#stage-motion');
  function updateStageMotion() {
    stageMotion.setAttribute('aria-pressed', String(root.classList.contains('paused')));
    stageMotion.textContent = root.classList.contains('paused') ? 'Resume motion ▷' : 'Pause motion Ⅱ';
  }
  stageMotion.addEventListener('click', () => document.querySelector('#motion').click());
  document.querySelector('#avatar-spotlight').addEventListener('click', () => {
    closeBubble();
    stage.showModal();
    document.body.classList.add('stage-open');
    updateStageMotion();
    document.querySelector('#close-stage').focus();
    wave(false);
  });
  document.querySelector('#close-stage').addEventListener('click', () => stage.close());
  stage.addEventListener('close', () => {
    document.body.classList.remove('stage-open');
    stopWave();
    document.querySelector('#avatar-spotlight').focus({ preventScroll: true });
  });

  function showGreeting() {
    const greetingNumber = greetingIndex++ % greetings.length;
    greeting.textContent = greetings[greetingNumber];
    window.dispatchEvent(new CustomEvent('avatar:say', { detail: { clip: `greeting-${greetingNumber}` } }));
    bubble.hidden = false;
    dragButton.setAttribute('aria-expanded', 'true');
    positionBubble();
  }

  function resetLook() {
    art.forEach(element => {
      element.style.removeProperty('--avatar-look');
      element.style.removeProperty('--avatar-lean');
    });
  }

  function reactToPointer() {
    frame = undefined;
    if (!lastPointer || !motionAllowed() || drag) return;
    art.forEach(element => {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const x = clamp((lastPointer.x - bounds.left - bounds.width / 2) / (window.innerWidth / 2), -1, 1);
      element.style.setProperty('--avatar-look', `${x * 12}deg`);
      element.style.setProperty('--avatar-lean', `${x * 3}deg`);
    });
  }

  function endDrag(event) {
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    const pointerId = drag.pointerId;
    if (drag.moved || event?.type === 'pointercancel') suppressedClickUntil = performance.now() + 450;
    drag = undefined;
    companion.classList.remove('is-dragging');
    if (dragButton.hasPointerCapture(pointerId)) dragButton.releasePointerCapture(pointerId);
  }

  dragButton.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    const bounds = companion.getBoundingClientRect();
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top, moved: false };
    dragButton.setPointerCapture(event.pointerId);
  }, options);

  dragButton.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      companion.classList.add('is-dragging');
      closeBubble();
      stopWave();
      resetLook();
    }
    moveTo(drag.left + dx, drag.top + dy);
  }, options);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => dragButton.addEventListener(type, endDrag, options));

  dragButton.addEventListener('click', event => {
    if (event.detail !== 0 && performance.now() < suppressedClickUntil) return;
    wave(false);
    if (bubble.hidden) showGreeting();
    else closeBubble();
  }, options);

  dragButton.addEventListener('keydown', event => {
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (event.key === 'Home') {
      event.preventDefault();
      resetPosition();
    } else if (moves[event.key]) {
      event.preventDefault();
      const bounds = companion.getBoundingClientRect();
      const step = event.shiftKey ? 40 : 16;
      moveTo(bounds.left + moves[event.key][0] * step, bounds.top + moves[event.key][1] * step);
    }
  }, options);

  function restore(focus = true) {
    companion.hidden = false;
    restoreButton.hidden = true;
    if (position) moveTo(position.x, position.y);
    else resetPosition();
    if (focus) dragButton.focus({ preventScroll: true });
  }

  dismissButton.addEventListener('click', () => {
    endDrag();
    closeBubble();
    stopWave();
    companion.hidden = true;
    restoreButton.hidden = false;
    restoreButton.focus({ preventScroll: true });
  }, options);
  restoreButton.addEventListener('click', () => { restore(); wave(); }, options);
  portrait?.addEventListener('click', () => {
    if (companion.hidden) restore(false);
    wave(false);
    showGreeting();
  }, options);

  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !motionAllowed()) return;
    lastPointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(reactToPointer);
  }, { ...options, passive: true });
  document.addEventListener('pointerleave', resetLook, options);
  window.addEventListener('blur', () => { endDrag(); resetLook(); }, options);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || bubble.hidden) return;
    const bubbleHadFocus = bubble.contains(document.activeElement);
    closeBubble();
    if (bubbleHadFocus) dragButton.focus({ preventScroll: true });
  }, options);
  document.addEventListener('click', event => {
    if (!companion.contains(event.target) && !portrait?.contains(event.target)) closeBubble();
  }, options);
  bubble.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    const target = link.hash && document.getElementById(link.hash.slice(1));
    closeBubble();
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
  }, options));

  function resize() {
    if (companion.hidden) return;
    endDrag();
    if (position) moveTo(position.x, position.y);
    else resetPosition();
  }
  window.addEventListener('resize', resize, { ...options, passive: true });
  window.visualViewport?.addEventListener('resize', resize, { ...options, passive: true });
  window.visualViewport?.addEventListener('scroll', resize, { ...options, passive: true });
  reducedMotion.addEventListener('change', resetLook, options);
  const motionObserver = new MutationObserver(() => { if (!motionAllowed()) resetLook(); updateStageMotion(); });
  motionObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopWave(); endDrag(); resetLook(); }
  }, options);

  window.addEventListener('pagehide', event => {
    stopWave();
    endDrag();
    if (frame) cancelAnimationFrame(frame);
    frame = undefined;
    if (!event.persisted) { controllers.abort(); motionObserver.disconnect(); }
  }, options);

  dragButton.setAttribute('aria-controls', 'avatar-message');
  dragButton.setAttribute('aria-expanded', 'false');
  companion.classList.add('is-ready');
  resetPosition();
})();
