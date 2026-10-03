const siteMenus = [...document.querySelectorAll('.shell-menu, .mobile-site-menu')];
const editionPickers = [...document.querySelectorAll('.edition-picker')];

if (siteMenus.length) {
  addEventListener('click', (event) => {
    siteMenus.forEach((menu) => {
      if (menu.open && !menu.contains(event.target)) menu.removeAttribute('open');
    });
  });

  addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    siteMenus.forEach((menu) => {
      if (!menu.open) return;
      menu.removeAttribute('open');
      menu.querySelector('summary')?.focus();
    });
  });

  siteMenus.forEach((menu) => {
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => menu.removeAttribute('open'));
    });
  });
}

editionPickers.forEach((picker) => {
  const list = picker.querySelector('.edition-list');
  const months = [...picker.querySelectorAll('.edition-month')];

  const revealActiveDate = (month) => {
    const active = month?.querySelector('.edition-option.active');
    if (!list || !active || !month.open) return;
    requestAnimationFrame(() => {
      const listBox = list.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();
      if (activeBox.top < listBox.top || activeBox.bottom > listBox.bottom) {
        list.scrollTop += activeBox.top - listBox.top - (list.clientHeight - active.clientHeight) / 2;
      }
    });
  };

  months.forEach((month) => {
    month.addEventListener('toggle', () => {
      if (!month.open) return;
      months.forEach((otherMonth) => {
        if (otherMonth !== month) otherMonth.removeAttribute('open');
      });
      revealActiveDate(month);
    });
  });

  picker.addEventListener('toggle', () => {
    if (!picker.open) return;
    revealActiveDate(months.find((month) => month.open));
  });
});
