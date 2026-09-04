const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
reveals.forEach((el) => revealObserver.observe(el));

const sections = [...document.querySelectorAll('.poster')];
const railLinks = [...document.querySelectorAll('.section-rail a')];
const navLinks = [...document.querySelectorAll('.site-nav nav a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const index = sections.indexOf(entry.target);
    railLinks.forEach((link, i) => link.classList.toggle('active', i === index));
    navLinks.forEach((link, i) => link.classList.toggle('active', i === index));
  });
}, { threshold: 0.42 });
sections.forEach((section) => sectionObserver.observe(section));

const progress = document.getElementById('progressBar');
const backTop = document.querySelector('.back-top');
function updateScrollUI() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  progress.style.width = `${max > 0 ? (doc.scrollTop / max) * 100 : 0}%`;
  backTop.classList.toggle('show', doc.scrollTop > window.innerHeight * 0.8);
}
addEventListener('scroll', updateScrollUI, { passive: true });
addEventListener('resize', updateScrollUI, { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
updateScrollUI();

const editionPicker = document.querySelector('.edition-picker');
if (editionPicker) {
  addEventListener('click', (event) => {
    if (editionPicker.open && !editionPicker.contains(event.target)) {
      editionPicker.removeAttribute('open');
    }
  });
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && editionPicker.open) {
      editionPicker.removeAttribute('open');
      editionPicker.querySelector('summary').focus();
    }
  });
}
