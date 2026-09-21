(() => {
  'use strict';
  const root = document.documentElement;
  const portrait = document.querySelector('#portrait');
  const motionButton = document.querySelector('#motion');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  root.classList.add('js-ready');

  function updateMotion() {
    root.classList.toggle('paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
    portrait.style.transform = '';
    if (paused) document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  }
  updateMotion();
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; updateMotion(); });

  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu(restoreFocus = false) {
    navigation.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuToggle.focus();
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    const wasOpen = navigation.classList.contains('is-open');
    closeMenu();
    if (wasOpen) {
      const target = document.querySelector(link.hash);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  window.matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.project-card')];
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    document.querySelector('#project-count').textContent = `${count} project${count === 1 ? '' : 's'}`;
  }));

  const projects = {
    resume: {
      title: 'AI Resume Reviewer', category: '01 / AI & CAREER TECHNOLOGY',
      description: 'An AI-powered résumé analysis tool that helps job seekers understand how to improve their résumés with focused, actionable feedback.',
      role: 'Developed a résumé analysis tool using large language models (LLMs).',
      features: ['AI-generated feedback on résumé content.', 'Applicant tracking system (ATS) scoring.', 'Improvement suggestions to support résumé refinement.']
    },
    interview: {
      title: 'AI Interview Coach', category: '02 / AI & CAREER TECHNOLOGY',
      description: 'A mock interview platform designed to bring structured practice and personalized feedback into interview preparation.',
      role: 'Designed a platform for AI-assisted mock interviews.',
      features: ['AI-generated questions for mock interview practice.', 'Personalized feedback on interview responses.', 'Performance scoring to support self-assessment.']
    },
    destiny: {
      title: 'Learning Destiny AI', category: '03 / AI & EDUCATION TECHNOLOGY',
      description: 'An AI-based overseas education assistant designed to bring the key steps of the study-abroad journey into one experience.',
      role: 'Designed an AI-based assistant for overseas education planning.',
      features: ['University matching to help students explore their options.', 'Statement of purpose (SOP) guidance.', 'Visa checklists for application preparation.', 'Application tracking to organize the journey.']
    }
  };
  const dialog = document.querySelector('#project-dialog');
  let dialogTrigger;
  function openProject(key, button = document.activeElement) {
    const project = projects[key];
    if (!project) return;
    dialogTrigger = button;
    dialog.dataset.project = key;
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-category').textContent = project.category;
    document.querySelector('#dialog-description').textContent = project.description;
    document.querySelector('#dialog-role').textContent = project.role;
    document.querySelector('#dialog-features').replaceChildren(...project.features.map(feature => {
      const item = document.createElement('li');
      item.textContent = feature;
      return item;
    }));
    document.querySelector('#project-contact').href = `mailto:devabakthunipranav2022@gmail.com?subject=${encodeURIComponent(`Let’s talk about ${project.title}`)}`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('dialog-open');
    document.querySelector('#close-dialog').focus();
    window.dispatchEvent(new CustomEvent('portfolio:project-open', { detail: { key } }));
  }
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.project, button)));
  window.PortfolioProjects = { items: projects, open: openProject };
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  let backdropPointerDown = false;
  dialog.addEventListener('pointerdown', event => { backdropPointerDown = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (backdropPointerDown && event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
    backdropPointerDown = false;
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (!document.querySelector('dialog[open]') && document.activeElement === document.body) dialogTrigger?.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent('portfolio:project-close'));
  });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(selected, focus = false) {
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) selected.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
    });
  });

  document.querySelector('#copy-email').addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText('devabakthunipranav2022@gmail.com');
      status.textContent = 'Email copied!';
    } catch {
      status.textContent = 'Select the email address to copy it, or click it to send a message.';
    }
  });
  document.querySelector('#year').textContent = new Date().getFullYear();

  const progress = document.querySelector('.reading-progress');
  const sections = [...document.querySelectorAll('main > section[id]')];
  const navLinks = [...navigation.querySelectorAll('a')];
  let scrollPending = false;
  function updateScroll() {
    const maxScroll = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0})`;
    let current;
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 155) current = section.id; });
    navLinks.forEach(link => {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollPending = false;
  }
  function scheduleScroll() { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); } }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  updateScroll();
  if ('IntersectionObserver' in window && !paused) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.section-heading, .impact-strip, .skills-intro, .beyond-content, .certifications').forEach(element => {
      element.classList.add('reveal');
      observer.observe(element);
    });
  }
})();
