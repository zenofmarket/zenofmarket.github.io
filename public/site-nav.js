const siteMenus = [...document.querySelectorAll('.shell-menu, .mobile-site-menu')];

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
