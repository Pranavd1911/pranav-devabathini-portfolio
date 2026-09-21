(() => {
  'use strict';
  const section = document.querySelector('#play');
  if (!section) return;

  const symbols = ['✦', '◒', '⌘'];
  const memory = { cards: [], open: [], matches: 0, flips: 0, active: false, locked: false };
  const memoryGrid = section.querySelector('#memory-grid');
  const memoryScore = section.querySelector('#memory-score');
  const memoryPrompt = section.querySelector('#memory-prompt');
  const memoryStatus = section.querySelector('#memory-status');
  const memoryStart = section.querySelector('#memory-start');
  const memoryReset = section.querySelector('#memory-reset');

  function shuffled(values) { return [...values].sort(() => Math.random() - .5); }
  function renderMemoryCard(index) {
    const card = memory.cards[index];
    const button = memoryGrid.children[index];
    button.textContent = card.open || card.matched ? card.symbol : '?';
    button.classList.toggle('open', card.open);
    button.classList.toggle('matched', card.matched);
    button.setAttribute('aria-label', card.open || card.matched ? `Pattern ${card.symbol}` : 'Hidden pattern card');
  }
  function updateMemoryScore() { memoryScore.textContent = `${memory.matches} / ${symbols.length}`; }
  function buildMemory() {
    memory.cards = shuffled([...symbols, ...symbols].map((symbol, index) => ({ symbol, index, open: false, matched: false })));
    memory.open = [];
    memory.matches = 0;
    memory.flips = 0;
    memory.locked = false;
    memoryGrid.replaceChildren(...memory.cards.map((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'memory-card';
      button.dataset.index = index;
      button.setAttribute('aria-label', 'Hidden pattern card');
      button.addEventListener('click', () => flipMemory(index));
      return button;
    }));
    updateMemoryScore();
  }
  function startMemory() {
    memory.active = true;
    memoryStart.hidden = true;
    memoryReset.hidden = false;
    memoryPrompt.textContent = 'Find the three pairs.';
    memoryStatus.textContent = 'Flip two cards. Matching symbols stay lit.';
    buildMemory();
  }
  function flipMemory(index) {
    if (!memory.active || memory.locked) return;
    const card = memory.cards[index];
    if (card.open || card.matched) return;
    card.open = true;
    memory.open.push(index);
    memory.flips++;
    renderMemoryCard(index);
    if (memory.open.length < 2) return;
    const [firstIndex, secondIndex] = memory.open;
    const first = memory.cards[firstIndex];
    const second = memory.cards[secondIndex];
    if (first.symbol === second.symbol) {
      first.matched = true;
      second.matched = true;
      memory.matches++;
      memory.open = [];
      renderMemoryCard(firstIndex);
      renderMemoryCard(secondIndex);
      updateMemoryScore();
      if (memory.matches === symbols.length) {
        memory.active = false;
        memoryPrompt.textContent = 'Pattern complete.';
        memoryStatus.textContent = `Cleared in ${memory.flips} flips. Nice pattern recognition.`;
        memoryStart.hidden = false;
        memoryStart.textContent = 'Play again';
      } else {
        memoryStatus.textContent = 'Match found. Keep looking.';
      }
      return;
    }
    memory.locked = true;
    memoryStatus.textContent = 'Not a match. Try another pair.';
    window.setTimeout(() => {
      first.open = false;
      second.open = false;
      renderMemoryCard(firstIndex);
      renderMemoryCard(secondIndex);
      memory.open = [];
      memory.locked = false;
    }, 650);
  }
  memoryStart.addEventListener('click', startMemory);
  memoryReset.addEventListener('click', () => {
    memory.active = false;
    memoryStart.hidden = false;
    memoryStart.textContent = 'Shuffle cards';
    memoryReset.hidden = true;
    memoryPrompt.textContent = 'Find the three matching product pairs.';
    memoryStatus.textContent = 'Match the symbols in as few flips as possible.';
    memoryGrid.replaceChildren();
    memoryScore.textContent = '0 / 3';
  });

  const bug = { active: false, score: 0, time: 10, timer: 0, moveTimer: 0 };
  const bugBoard = section.querySelector('#bug-board');
  const bugTarget = section.querySelector('#bug-target');
  const bugScore = section.querySelector('#bug-score');
  const bugTimer = section.querySelector('#bug-timer');
  const bugPrompt = section.querySelector('#bug-prompt');
  const bugStatus = section.querySelector('#bug-status');
  const bugStart = section.querySelector('#bug-start');
  const bugReset = section.querySelector('#bug-reset');
  function placeBug() {
    bugTarget.style.left = `${12 + Math.random() * 76}%`;
    bugTarget.style.top = `${18 + Math.random() * 58}%`;
  }
  function endBugHunt() {
    bug.active = false;
    window.clearInterval(bug.timer);
    window.clearInterval(bug.moveTimer);
    bugTarget.disabled = true;
    bugTarget.hidden = true;
    bugStart.hidden = false;
    bugStart.textContent = 'Hunt again';
    bugReset.hidden = true;
    bugPrompt.textContent = bug.score >= 8 ? 'Excellent bug radar.' : 'The sprint is over.';
    bugStatus.textContent = `${bug.score} bugs cleared. ${bug.score >= 8 ? 'Ship it.' : 'Try to beat your score.'}`;
  }
  function startBugHunt() {
    window.clearInterval(bug.timer);
    window.clearInterval(bug.moveTimer);
    bug.active = true;
    bug.score = 0;
    bug.time = 10;
    bugScore.textContent = '0 bugs';
    bugTimer.textContent = '10s';
    bugPrompt.textContent = 'Find them before the timer runs out.';
    bugStatus.textContent = 'Click the bug. It moves after every hit.';
    bugStart.hidden = true;
    bugReset.hidden = false;
    bugTarget.hidden = false;
    bugTarget.disabled = false;
    placeBug();
    bug.moveTimer = window.setInterval(placeBug, 1800);
    bug.timer = window.setInterval(() => {
      bug.time--;
      bugTimer.textContent = `${bug.time}s`;
      if (bug.time <= 0) endBugHunt();
    }, 1000);
  }
  bugTarget.addEventListener('click', () => {
    if (!bug.active) return;
    bug.score++;
    bugScore.textContent = `${bug.score} bug${bug.score === 1 ? '' : 's'}`;
    bugTarget.animate([{ transform: 'scale(1.35) rotate(-12deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 180 });
    placeBug();
  });
  bugStart.addEventListener('click', startBugHunt);
  bugReset.addEventListener('click', () => {
    window.clearInterval(bug.timer);
    window.clearInterval(bug.moveTimer);
    bug.active = false;
    bugTarget.hidden = false;
    bugTarget.disabled = true;
    bugTarget.style.left = '50%';
    bugTarget.style.top = '50%';
    bugScore.textContent = '0 bugs';
    bugTimer.textContent = '10s';
    bugStart.hidden = false;
    bugStart.textContent = 'Start hunt';
    bugReset.hidden = true;
    bugPrompt.textContent = 'Clear the board before the timer runs out.';
    bugStatus.textContent = 'Click every bug you see. Faster is better.';
  });
})();
