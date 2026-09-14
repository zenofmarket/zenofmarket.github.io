const thesisSections = [...document.querySelectorAll('[id="overview"], [id="pressure-points"], [id="fomc-paths"], [id="market-test"]')];
const thesisLinks = [...document.querySelectorAll('.article-sections a')];

if (thesisSections.length && thesisLinks.length) {
  const thesisObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      thesisLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.16, rootMargin: '-10% 0px -58% 0px' });
  thesisSections.forEach((section) => thesisObserver.observe(section));
}

const thesisProgress = document.getElementById('progressBar');
const thesisBackTop = document.querySelector('.thesis-back-top');

function updateThesisScrollUI() {
  const root = document.documentElement;
  const max = root.scrollHeight - root.clientHeight;
  if (thesisProgress) thesisProgress.style.width = `${max > 0 ? (root.scrollTop / max) * 100 : 0}%`;
  if (thesisBackTop) thesisBackTop.classList.toggle('show', root.scrollTop > innerHeight * 0.8);
}

addEventListener('scroll', updateThesisScrollUI, { passive: true });
addEventListener('resize', updateThesisScrollUI, { passive: true });
thesisBackTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
updateThesisScrollUI();
