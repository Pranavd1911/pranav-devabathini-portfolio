(() => {
  'use strict';
  const section = document.querySelector('#pathfinder');
  if (!section) return;
  const routes = {
    recruiter: {
      kicker: 'THE FAST TRACK',
      title: 'Start with the 60-second overview.',
      description: 'A concise tour of the product work, founder experience, and the signals I bring to an AI product team.',
      stops: ['Overview: the headline outcomes', 'Experience: how the work happened', 'Connect: start the conversation'],
      href: '#overview'
    },
    builder: {
      kicker: 'THE DEEP DIVE',
      title: 'See how an idea becomes a decision.',
      description: 'Follow the thread from customer insight to prioritization, product execution, and the tradeoffs behind the work.',
      stops: ['Projects: the things I made', 'Product lab: a live RICE sandbox', 'Skills: the toolkit behind the decisions'],
      href: '#projects'
    },
    curious: {
      kicker: 'THE SIDE DOOR',
      title: 'Meet the person behind the product.',
      description: 'Take the less predictable route: voice, avatar gestures, tiny games, and a few details that do not fit on a résumé.',
      stops: ['Listen in: hear the story', 'Play: take a quick break', 'Away from the screen: the human bits'],
      href: '#listen'
    }
  };
  const options = [...section.querySelectorAll('[data-path]')];
  const kicker = section.querySelector('#path-kicker');
  const title = section.querySelector('#path-title');
  const description = section.querySelector('#path-description');
  const stops = section.querySelector('#path-stops');
  const cta = section.querySelector('#path-cta');
  function renderRoute(key) {
    const route = routes[key];
    options.forEach(option => option.classList.toggle('active', option.dataset.path === key));
    kicker.textContent = route.kicker;
    title.textContent = route.title;
    description.textContent = route.description;
    stops.replaceChildren(...route.stops.map(stop => {
      const item = document.createElement('li');
      item.textContent = stop;
      return item;
    }));
    cta.href = route.href;
  }
  options.forEach(option => option.addEventListener('click', () => renderRoute(option.dataset.path)));
  renderRoute('recruiter');
})();
