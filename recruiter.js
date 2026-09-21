(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const projectAPI = window.PortfolioProjects;
  const projects = projectAPI.items;
  const email = 'devabakthunipranav2022@gmail.com';
  const summary = "Pranav Chowdary Devabathini | AI & Product | Austin, TX\nFounder of Learning Destiny: launched 3 education technology products, increased student retention by 40%, and led cross-functional teams of 50+.\nDeveloped an LLM-based AI Resume Reviewer; designed AI Interview Coach and Learning Destiny AI.\nB.Tech in Computer Science; currently pursuing MS Information Technology Management at Webster University (expected 2027).\nExploring Product Management, AI Product, Associate PM, and Product Intern opportunities.\n" + email + ' | +1 (425) 547-0771\nhttps://www.linkedin.com/in/pranavdevabathini';
  const context = {
    resume: { status: 'Developed', audience: 'Job seekers refining their résumés', questions: ['How would we check that feedback is accurate and actionable?', 'What would tell us that a suggested revision helped the applicant?', 'How should uncertainty in an ATS score be communicated?'] },
    interview: { status: 'Designed', audience: 'Candidates practicing for interviews', questions: ['How should question difficulty adapt to the candidate and role?', 'How would we evaluate the usefulness and fairness of feedback?', 'Which signals would show that practice improves confidence and preparation?'] },
    destiny: { status: 'Designed', audience: 'Students planning overseas education', questions: ['Which application step creates the most friction for students?', 'How should university and visa information be kept current?', 'What would make a student trust a university recommendation?'] }
  };
  async function copy(text, status) {
    try { await navigator.clipboard.writeText(text); status.textContent = 'Copied to clipboard.'; }
    catch { status.textContent = 'Copy is unavailable. Select the text below to copy it.'; const area = document.createElement('textarea'); area.value = text; area.readOnly = true; area.setAttribute('aria-label', 'Text to copy'); status.append(area); area.select(); }
  }
  $('#copy-summary').addEventListener('click', () => copy(summary, $('#summary-status')));
  $('#print-brief').addEventListener('click', () => window.open('brief.html?print=1', '_blank', 'noopener'));
  const roleEvidence = {
    ai: ['Technical foundation. Product judgment.', 'LLM-based résumé analysis, AI product concepts, and experience prioritizing real customer needs.', '#projects', 'Explore the AI projects ↗'],
    apm: ['Turn feedback into a clear next step.', 'Product strategy and prioritization at Learning Destiny, plus requirements and stakeholder alignment for student initiatives.', '#experience', 'Explore the product experience ↗'],
    intern: ['Curiosity backed by hands-on experience.', 'A computer science degree, web development internship, and current graduate study in Information Technology Management.', '#journey', 'Explore the learning journey ↗']
  };
  document.querySelectorAll('[data-role-fit]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-role-fit]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const [title, text, href, link] = roleEvidence[button.dataset.roleFit];
    $('#role-evidence h3').textContent = title; $('#role-evidence p').textContent = text;
    $('#role-evidence a').href = href; $('#role-evidence a').textContent = link;
  }));

  let saved = new Set();
  try { const list = JSON.parse(localStorage.getItem('pranav-project-shortlist') || '[]'); if (Array.isArray(list)) saved = new Set(list.filter(key => Object.hasOwn(projects, key))); } catch { /* Storage is optional. */ }
  document.querySelectorAll('.project-card').forEach(card => {
    const key = card.querySelector('[data-project]').dataset.project;
    const tag = document.createElement('span'); tag.className = 'project-state'; tag.textContent = context[key].status;
    card.querySelector('.tags').append(tag);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'save-project'; button.dataset.saveProject = key;
    card.querySelector('.card-caption').append(button);
    button.addEventListener('click', () => toggleSaved(key));
  });
  function renderSaved() {
    document.querySelectorAll('[data-save-project]').forEach(button => {
      const active = saved.has(button.dataset.saveProject);
      button.setAttribute('aria-pressed', String(active)); button.textContent = active ? '✓ Saved' : '+ Save';
      button.setAttribute('aria-label', `${active ? 'Remove' : 'Save'} ${projects[button.dataset.saveProject].title}${active ? ' from shortlist' : ' to shortlist'}`);
    });
    $('#shortlist-count').textContent = saved.size;
    $('#compare-projects').disabled = saved.size === 0; $('#clear-shortlist').disabled = saved.size === 0;
    const active = saved.has($('#project-dialog').dataset.project);
    $('#save-current-project').textContent = active ? '✓ Saved to shortlist' : '+ Save to shortlist';
    $('#save-current-project').setAttribute('aria-pressed', String(active));
  }
  function persistSaved() {
    try { localStorage.setItem('pranav-project-shortlist', JSON.stringify([...saved])); }
    catch { $('#shortlist-status').textContent = 'Saved for this visit. Browser storage is unavailable.'; }
    renderSaved();
  }
  function toggleSaved(key) {
    if (!Object.hasOwn(projects, key)) return;
    const wasSaved = saved.delete(key); if (!wasSaved) saved.add(key);
    $('#shortlist-status').textContent = `${projects[key].title} ${wasSaved ? 'removed.' : 'saved.'}`;
    persistSaved();
  }
  $('#clear-shortlist').addEventListener('click', () => { saved.clear(); $('#shortlist-status').textContent = 'Shortlist cleared.'; persistSaved(); });
  $('#save-current-project').addEventListener('click', () => toggleSaved($('#project-dialog').dataset.project));
  let syncingHistory = false;
  window.addEventListener('portfolio:project-open', event => {
    const key = event.detail.key;
    $('#project-context').replaceChildren();
    [['PROJECT SCOPE', context[key].status], ['WHO IT IS FOR', context[key].audience]].forEach(([label, text]) => {
      const box = document.createElement('div'), heading = document.createElement('small'), detail = document.createElement('p');
      heading.textContent = label; detail.textContent = text; box.append(heading, detail); $('#project-context').append(box);
    });
    $('#project-questions').replaceChildren(...context[key].questions.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    $('#project-link-status').textContent = ''; $('.project-evaluation').open = false; renderSaved();
    if (!syncingHistory) { const url = new URL(location.href); url.searchParams.set('project', key); if (url.href !== location.href) history.pushState(null, '', url); }
  });
  window.addEventListener('portfolio:project-close', () => {
    if (syncingHistory) return;
    // A queued close event must not clear a newly opened project's URL.
    if ($('#project-dialog').open) return;
    const url = new URL(location.href); url.searchParams.delete('project'); history.replaceState(null, '', url);
  });
  $('#share-project').addEventListener('click', () => { const url = new URL(location.href); url.searchParams.set('project', $('#project-dialog').dataset.project); copy(url.href, $('#project-link-status')); });
  function syncProjectLink() {
    const key = new URL(location.href).searchParams.get('project');
    syncingHistory = true;
    if (Object.hasOwn(projects, key)) projectAPI.open(key, $('[data-project="' + key + '"]'));
    else if ($('#project-dialog').open) $('#project-dialog').close();
    syncingHistory = false;
  }
  window.addEventListener('popstate', syncProjectLink);
  renderSaved();

  const utilityDialogs = [...document.querySelectorAll('.utility-dialog')];
  function openUtility(dialog, trigger = document.activeElement) {
    if (document.querySelector('dialog[open]')) return;
    dialog.returnFocus = trigger; dialog.showModal(); document.body.classList.add('dialog-open');
    window.dispatchEvent(new Event('portfolio:quiet'));
  }
  utilityDialogs.forEach(dialog => {
    dialog.querySelector('[data-close-utility]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.classList.toggle('dialog-open', !!document.querySelector('.utility-dialog[open], #project-dialog[open]'));
      // Native dialogs restore focus synchronously. Only supply a fallback;
      // the later close event must not steal focus from another control.
      if (!document.querySelector('dialog[open]') && document.activeElement === document.body) dialog.returnFocus?.focus({ preventScroll: true });
    });
    let backdrop = false;
    dialog.addEventListener('pointerdown', event => { backdrop = event.target === dialog; });
    dialog.addEventListener('click', event => {
      if (backdrop && event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); }
      backdrop = false;
    });
  });
  $('#compare-projects').addEventListener('click', () => {
    $('#comparison-grid').replaceChildren(); $('#compare-status').textContent = '';
    [...saved].forEach(key => {
      const column = document.createElement('article');
      const status = document.createElement('span'); status.className = 'project-state'; status.textContent = context[key].status;
      const title = document.createElement('h3'); title.textContent = projects[key].title;
      const audience = document.createElement('p'); audience.textContent = context[key].audience;
      const role = document.createElement('p'); role.textContent = projects[key].role;
      const list = document.createElement('ul'); projects[key].features.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.append(li); });
      const button = document.createElement('button'); button.type = 'button'; button.className = 'subtle-button'; button.textContent = 'Open project ↗';
      button.addEventListener('click', () => { $('#compare-dialog').close(); projectAPI.open(key, $('#compare-projects')); });
      column.append(status, title, audience, role, list, button); $('#comparison-grid').append(column);
    });
    openUtility($('#compare-dialog'));
  });
  $('#copy-shortlist').addEventListener('click', () => copy('Pranav Devabathini — selected projects\n\n' + [...saved].map(key => projects[key].title + ' (' + context[key].status + ')\n' + projects[key].role + '\n' + projects[key].features.join('\n')).join('\n\n') + '\n\nContact: ' + email, $('#compare-status')));

  const defaults = [
    { name: 'Application reminders', reach: 300, impact: 2, confidence: 80, effort: 2 },
    { name: 'Clearer onboarding', reach: 600, impact: 1, confidence: 80, effort: 1 },
    { name: 'University comparison', reach: 200, impact: 3, confidence: 50, effort: 2 }
  ];
  const fields = ['reach', 'impact', 'confidence', 'effort'];
  function buildRice() {
    $('#rice-inputs').replaceChildren();
    defaults.forEach((item, i) => {
      const row = document.createElement('tr'), title = document.createElement('th'); title.scope = 'row'; title.textContent = item.name; row.append(title);
      fields.forEach(field => {
        const cell = document.createElement('td'), input = document.createElement('input'); input.type = 'number'; input.required = true;
        input.min = field === 'effort' ? '.1' : field === 'impact' ? '.25' : '0';
        input.max = field === 'reach' ? '1000000' : field === 'impact' ? '3' : field === 'confidence' ? '100' : '1000';
        input.step = field === 'effort' ? '.1' : field === 'impact' ? '.25' : '1';
        input.value = item[field]; input.dataset.riceField = field; input.dataset.riceRow = i;
        input.setAttribute('aria-label', `${item.name}: ${field}`); cell.append(input); row.append(cell);
      });
      const score = document.createElement('td'); score.id = 'rice-score-' + i; score.className = 'rice-score'; row.append(score); $('#rice-inputs').append(row);
    });
    updateRice();
  }
  function readRice() {
    return defaults.map((base, i) => {
      const values = {}; let valid = true;
      fields.forEach(field => { const input = $(`[data-rice-row="${i}"][data-rice-field="${field}"]`); values[field] = input.valueAsNumber; if (!input.validity.valid || !Number.isFinite(values[field])) valid = false; });
      return { ...base, ...values, valid, index: i, score: valid ? values.reach * values.impact * (values.confidence / 100) / values.effort : null };
    });
  }
  let announceTimer;
  function updateRice() {
    const items = readRice(), valid = items.every(item => item.valid);
    items.forEach(item => { $('#rice-score-' + item.index).textContent = item.valid ? item.score.toLocaleString('en-US', { maximumFractionDigits: 1 }) : '—'; });
    const ranked = items.filter(item => item.valid).sort((a, b) => b.score - a.score);
    $('#rice-ranking').replaceChildren(...ranked.map(item => {
      const li = document.createElement('li'), name = document.createElement('span'), score = document.createElement('strong'), bar = document.createElement('i');
      name.textContent = item.name; score.textContent = item.score.toLocaleString('en-US', { maximumFractionDigits: 1 }); bar.style.width = `${ranked[0].score ? item.score / ranked[0].score * 100 : 0}%`; bar.setAttribute('aria-hidden', 'true'); li.append(name, score, bar); return li;
    }));
    $('#rice-export').disabled = !valid;
    const top = ranked[0];
    const text = !valid ? 'Complete all estimates within the allowed ranges to compare all three ideas.' : ranked.length > 1 && top.score === ranked[1].score ? 'The leading ideas are tied. Explore confidence, dependencies, and strategic fit before choosing.' : `${top.name} ranks first with these estimates. Its score is ${top.score.toLocaleString('en-US', { maximumFractionDigits: 1 })}, based on ${top.reach} users, ${top.impact} impact, ${top.confidence}% confidence, and ${top.effort} person-month${top.effort === 1 ? '' : 's'} of effort.`;
    clearTimeout(announceTimer); announceTimer = setTimeout(() => { $('#rice-insight').textContent = text; }, 200);
  }
  $('#rice-inputs').addEventListener('input', updateRice);
  $('#rice-reset').addEventListener('click', buildRice);
  $('#rice-export').addEventListener('click', () => {
    const rows = readRice(); if (rows.some(row => !row.valid)) return;
    const csv = 'Illustrative portfolio exercise — not historical company results\r\nIdea,Reach (users per quarter),Impact,Confidence (%),Effort (person-months),RICE score\r\n' + rows.sort((a, b) => b.score-a.score).map(row => [row.name, ...fields.map(field => row[field]), row.score.toFixed(2)].join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'pranav-prioritization-exercise.csv'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  buildRice();

  const commands = [
    ...[['overview', '60-second hiring overview', 'recruiter summary strengths role fit'], ['projects', 'Selected AI projects', 'work portfolio resume interview destiny'], ['product-lab', 'Interactive product lab', 'rice prioritization sandbox calculator'], ['play', 'Play Launch Sprint', 'game arcade avatar ideas bugs fun'], ['experience', 'Experience & leadership', 'founder learning destiny work'], ['skills', 'Skills & toolkit', 'product technology leadership'], ['journey', 'Education & certifications', 'university washington webster bachelor training'], ['hiring-faq', 'Hiring questions', 'location roles degrees faq'], ['connect', 'Contact Pranav', 'email phone linkedin hire']].map(([id, title, keywords]) => ({ title, keywords, type: 'Section', action: () => { location.hash = id; const target = document.getElementById(id); target.tabIndex = -1; target.focus({ preventScroll: true }); } })),
    ...Object.entries(projects).map(([key, item]) => ({ title: item.title, keywords: item.description, type: 'Project', action: () => projectAPI.open(key, $('[data-project="' + key + '"]')) })),
    { title: 'Download résumé', keywords: 'resume cv pdf experience', type: 'Download', action: () => $('[download][href="assets/pranav-devabathini-resume.pdf"]').click() },
    { title: 'Download one-page brief', keywords: 'recruiter hiring summary pdf', type: 'Download', action: () => $('[download][href="assets/pranav-recruiter-brief.pdf"]').click() },
    { title: 'Listen to my introduction', keywords: 'avatar voice narration audio speak', type: 'Audio', action: () => $('.portrait-controls [data-voice-play]').click() },
    { title: 'Switch light / dark theme', keywords: 'appearance mode color', type: 'Setting', action: () => $('#theme-toggle').click() }
  ];
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let results = [], activeIndex = 0;
  function highlightCommand() {
    [...$('#command-results').children].forEach((item, index) => item.setAttribute('aria-selected', String(index === activeIndex)));
    if (results.length) { $('#command-input').setAttribute('aria-activedescendant', 'command-result-' + activeIndex); $('#command-result-' + activeIndex).scrollIntoView({ block: 'nearest' }); }
    else $('#command-input').removeAttribute('aria-activedescendant');
  }
  function chooseCommand(index) { const item = results[index]; if (!item) return; $('#command-dialog').close(); requestAnimationFrame(() => item.action()); }
  function searchCommands() {
    const query = normalize($('#command-input').value.trim());
    results = commands.filter(item => normalize(item.title + ' ' + item.keywords).includes(query)); activeIndex = 0;
    $('#command-results').replaceChildren(...results.map((item, index) => {
      const option = document.createElement('div'); option.id = 'command-result-' + index; option.setAttribute('role', 'option');
      const title = document.createElement('span'), type = document.createElement('small'); title.textContent = item.title; type.textContent = item.type;
      option.append(title, type); option.addEventListener('click', () => chooseCommand(index)); return option;
    }));
    $('#command-status').textContent = results.length ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'No matches. Try “projects”, “education”, or “contact”.'; highlightCommand();
  }
  function openCommand() { if (document.querySelector('dialog[open]')) return; $('#command-input').value = ''; openUtility($('#command-dialog')); searchCommands(); $('#command-input').focus(); }
  document.querySelectorAll('[data-command-open]').forEach(button => button.addEventListener('click', openCommand));
  document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if ($('#command-dialog').open) $('#command-dialog').close(); else openCommand(); } });
  $('#command-input').addEventListener('input', searchCommands);
  $('#command-input').addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); $('#command-dialog').close(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); if (results.length) activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length; highlightCommand(); }
    if (event.key === 'Enter') { event.preventDefault(); chooseCommand(activeIndex); }
  });
  $('#contact-form').addEventListener('submit', event => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const company = String(data.get('company')).trim(), role = String(data.get('role')).trim(), message = String(data.get('message')).trim();
    if (!company || !role) return;
    const body = `Hi Pranav,\n\nI'm reaching out from ${company} about a ${role} opportunity.\n\n${message}\n\n${saved.size ? 'Projects that caught my attention: ' + [...saved].map(key => projects[key].title).join(', ') + '.\n\n' : ''}Best,\n`;
    location.href = `mailto:${email}?subject=${encodeURIComponent(role + ' opportunity at ' + company)}&body=${encodeURIComponent(body)}`;
  });
  syncProjectLink();
})();
