(() => {
  const grid = document.querySelector('.archive-grid');
  const loader = document.querySelector('[data-archive-load-more]');
  if (!grid || !loader) return;

  const button = loader.querySelector('button');
  const cards = [...grid.querySelectorAll('.recap-card')];
  const pageSize = 6;

  cards.forEach((card, index) => {
    card.hidden = index >= pageSize;
  });

  function updateLoader() {
    const remaining = cards.filter((card) => card.hidden).length;
    loader.hidden = remaining === 0;
    if (remaining > 0) {
      button.setAttribute('aria-label', 'Load up to ' + Math.min(pageSize, remaining) + ' older market recaps');
    }
  }

  button.addEventListener('click', () => {
    cards
      .filter((card) => card.hidden)
      .slice(0, pageSize)
      .forEach((card) => {
        card.hidden = false;
      });
    updateLoader();
  });

  updateLoader();
})();
