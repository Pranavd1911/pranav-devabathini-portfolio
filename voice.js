(() => {
  'use strict';
  const voices = window.PORTFOLIO_VOICES || { india: { label: 'Indian English', clips: window.PORTFOLIO_VOICE_CLIPS } };
  const defaultVoice = window.PORTFOLIO_DEFAULT_VOICE || 'india';
  if (!voices[defaultVoice]?.clips) return;
  const preferenceVersion = 2;
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const art = [...document.querySelectorAll('.avatar-art')];
  const all = selector => [...document.querySelectorAll(selector)];
  const playButtons = all('[data-voice-play]'), toggles = all('[data-voice-toggle]');
  const pauseButtons = all('[data-voice-pause]'), stopButtons = all('[data-voice-stop]');
  let voiceKey = defaultVoice, enabled = false, phase = 'idle', activeAudio = null, activeClip = null;
  let rate = 1, volume = .85, frame = null, requestId = 0, source = 'explicit', lastCaption = '';
  try {
    const prefs = JSON.parse(localStorage.getItem('pranav-voice-preferences') || '{}');
    if (prefs.version === preferenceVersion && Object.hasOwn(voices, prefs.voice)) voiceKey = prefs.voice;
    if (prefs.version === preferenceVersion && [.85, 1, 1.15].includes(prefs.rate)) rate = prefs.rate;
    if (Number.isFinite(prefs.volume) && prefs.volume >= 0 && prefs.volume <= 1) volume = prefs.volume;
  } catch { /* Playback works without storage. */ }
  function preferences() {
    try { localStorage.setItem('pranav-voice-preferences', JSON.stringify({ version: preferenceVersion, voice: voiceKey, rate, volume })); } catch { /* Optional. */ }
  }
  const clipData = () => voices[voiceKey].clips[activeClip];
  const timeLabel = time => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
  function resetMouth() { art.forEach(element => { element.classList.remove('is-talking'); element.style.removeProperty('--mouth-position'); }); }
  function stopFrames() { if (frame !== null) cancelAnimationFrame(frame); frame = null; resetMouth(); }
  function updateProgress() {
    const data = clipData(), time = activeAudio?.currentTime || 0;
    const duration = Number.isFinite(activeAudio?.duration) ? activeAudio.duration : data?.duration || 0;
    all('[data-voice-seek]').forEach(input => {
      input.disabled = !activeAudio || phase === 'error'; input.max = duration || 1; input.value = time;
      input.setAttribute('aria-valuetext', `${timeLabel(time)} of ${timeLabel(duration)}`);
    });
    all('[data-voice-time]').forEach(element => { element.textContent = `${timeLabel(time)} / ${timeLabel(duration)}`; });
    if (!data) return;
    const sentence = data.sentences?.find(item => time >= item.start && time <= item.end + .25)
      || [...(data.sentences || [])].reverse().find(item => time >= item.start)
      || data.sentences?.[0];
    const caption = phase === 'error' ? data.text : sentence?.text || data.text;
    if (caption !== lastCaption) { all('[data-voice-text]').forEach(element => { element.textContent = caption; }); lastCaption = caption; }
  }
  function animateSpeech() {
    if (!activeAudio || phase !== 'playing') { stopFrames(); return; }
    const motionAllowed = !reduced.matches && !root.classList.contains('paused');
    const data = clipData();
    const cue = Number(data.mouth[Math.floor(activeAudio.currentTime * (data.mouthHz || 10))] || 0);
    art.forEach(element => {
      const canTalk = motionAllowed && !element.dataset.gesture && !element.closest('.is-waving');
      element.classList.toggle('is-talking', canTalk);
      if (canTalk) element.style.setProperty('--mouth-position', `${cue * 50}%`);
      else element.style.removeProperty('--mouth-position');
    });
    frame = requestAnimationFrame(animateSpeech);
  }
  function render(message) {
    document.body.classList.toggle('avatar-speaking', phase === 'playing');
    document.body.dataset.voiceState = phase;
    toggles.forEach(button => {
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', enabled ? 'Turn off spoken gesture replies' : 'Turn on spoken gesture replies');
      button.textContent = enabled ? 'Replies on ◖' : 'Replies off ◖';
    });
    playButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.voicePlay === activeClip && !['idle', 'error'].includes(phase))));
    pauseButtons.forEach(button => {
      button.disabled = !['playing', 'paused'].includes(phase);
      button.textContent = phase === 'paused' ? 'Resume' : 'Pause';
      button.setAttribute('aria-label', phase === 'paused' ? 'Resume narration' : 'Pause narration');
    });
    stopButtons.forEach(button => { button.disabled = phase === 'idle'; });
    all('[data-voice-status]').forEach(element => {
      element.textContent = message || (phase === 'playing' ? `${clipData().title} · ${voices[voiceKey].label}` : phase === 'paused' ? 'Paused. Resume when ready.' : phase === 'loading' ? 'Loading narration…' : 'Choose a topic to listen.');
    });
    all('[data-voice-caption]').forEach(element => { element.hidden = phase === 'idle'; });
    all('[data-voice-title]').forEach(element => { element.textContent = clipData()?.title || 'Pranav’s story'; });
    updateProgress();
    if (phase !== 'playing') stopFrames();
  }
  function stop(message = 'Stopped.') {
    requestId++; const previous = activeAudio; activeAudio = null; activeClip = null; lastCaption = '';
    if (previous) { previous.pause(); previous.removeAttribute('src'); previous.load(); previous.remove(); }
    phase = 'idle'; render(message);
  }
  function fail() { phase = 'error'; render('Audio couldn’t play. Read the transcript or tap a topic to retry.'); }
  function play(name, explicit = false) {
    if (!voices[voiceKey].clips[name]) return;
    // A greeting or gesture must never replace a visitor's chosen narration.
    if (!explicit && (!enabled || !['idle', 'error'].includes(phase))) return;
    stop(); source = explicit ? 'explicit' : 'gesture';
    const token = ++requestId; activeClip = name;
    const audio = new Audio(clipData().src); activeAudio = audio;
    audio.id = 'avatar-audio'; audio.hidden = true; audio.preload = 'none';
    audio.playbackRate = rate; audio.preservesPitch = true; audio.volume = volume;
    document.body.append(audio);
    all('[data-voice-transcript]').forEach(element => { element.textContent = clipData().text; });
    phase = 'loading'; render();
    const current = () => token === requestId && activeAudio === audio;
    audio.addEventListener('playing', () => { if (!current()) return; phase = 'playing'; render(); stopFrames(); animateSpeech(); });
    audio.addEventListener('pause', () => { if (!current() || audio.ended || phase === 'error') return; phase = 'paused'; render(); });
    audio.addEventListener('waiting', () => { if (!current()) return; phase = 'loading'; render(); });
    audio.addEventListener('timeupdate', () => { if (current()) updateProgress(); });
    audio.addEventListener('loadedmetadata', () => { if (current()) updateProgress(); });
    audio.addEventListener('ended', () => { if (current()) stop('Finished. Choose another topic.'); });
    audio.addEventListener('error', () => { if (current()) fail(); });
    audio.play().catch(() => { if (current()) fail(); });
  }
  playButtons.forEach(button => button.addEventListener('click', () => play(button.dataset.voicePlay, true)));
  toggles.forEach(button => button.addEventListener('click', () => {
    enabled = !enabled;
    if (enabled && phase === 'idle') play('wave');
    else if (!enabled && source === 'gesture') stop('Spoken gesture replies are off.');
    render();
  }));
  pauseButtons.forEach(button => button.addEventListener('click', () => {
    if (!activeAudio) return;
    if (phase === 'paused') { const audio = activeAudio; audio.play().catch(() => { if (activeAudio === audio) fail(); }); }
    else activeAudio.pause();
  }));
  stopButtons.forEach(button => button.addEventListener('click', () => stop()));
  all('[data-voice-rate]').forEach(select => {
    select.value = String(rate);
    select.addEventListener('change', () => { rate = Number(select.value); all('[data-voice-rate]').forEach(other => { other.value = String(rate); }); if (activeAudio) activeAudio.playbackRate = rate; preferences(); });
  });
  all('[data-voice-choice]').forEach(select => {
    select.replaceChildren(...Object.entries(voices).map(([key, voice]) => { const option = document.createElement('option'); option.value = key; option.textContent = voice.label; return option; }));
    select.value = voiceKey;
    select.addEventListener('change', () => {
      const previousClip = activeClip, playing = phase === 'playing';
      stop(); voiceKey = select.value; all('[data-voice-choice]').forEach(other => { other.value = voiceKey; }); preferences();
      if (previousClip && playing) play(previousClip, true); else render('Voice changed. Choose a topic to listen.');
    });
  });
  all('[data-voice-volume]').forEach(input => {
    input.value = Math.round(volume * 100);
    input.addEventListener('input', () => { volume = Number(input.value) / 100; if (activeAudio) activeAudio.volume = volume; all('[data-voice-volume]').forEach(other => { other.value = input.value; }); preferences(); });
  });
  all('[data-voice-seek]').forEach(input => input.addEventListener('input', () => { if (!activeAudio || !Number.isFinite(activeAudio.duration)) return; activeAudio.currentTime = Math.min(activeAudio.duration, Math.max(0, Number(input.value))); updateProgress(); }));
  window.addEventListener('avatar:say', event => play(event.detail?.clip));
  window.addEventListener('portfolio:quiet', () => stop());
  window.addEventListener('portfolio:project-open', () => stop());
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && phase !== 'idle') stop(); });
  document.addEventListener('click', event => { if (event.target.closest('a[href], #avatar-dismiss')) stop(); });
  document.querySelector('#avatar-stage').addEventListener('close', () => stop());
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', () => stop());
  render();
})();
