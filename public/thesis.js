const thesisLinks = [...document.querySelectorAll('.article-sections a')];
const thesisSections = thesisLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

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

const svgNamespace = 'http://www.w3.org/2000/svg';

document.querySelectorAll('.interactive-history-chart').forEach((chart) => {
  const line = chart.querySelector('.yield-line');
  const figure = chart.closest('.historical-chart');
  if (!line || !figure) return;

  const points = line.getAttribute('points').trim().split(/\s+/).map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return { x, y };
  });
  const values = chart.dataset.values.split(',');
  const dates = chart.dataset.dates.split(',');
  const notes = chart.dataset.notes.split(',');
  if (points.length !== values.length || points.length !== dates.length || points.length !== notes.length) return;

  const createSvgElement = (name, className) => {
    const element = document.createElementNS(svgNamespace, name);
    element.setAttribute('class', className);
    return element;
  };

  const layer = createSvgElement('g', 'history-interaction-layer');
  const vertical = createSvgElement('line', 'history-crosshair');
  const horizontal = createSvgElement('line', 'history-crosshair');
  vertical.setAttribute('y1', '42');
  vertical.setAttribute('y2', '254');
  horizontal.setAttribute('x1', '70');
  horizontal.setAttribute('x2', '710');

  points.forEach((point) => {
    const dot = createSvgElement('circle', 'history-hover-point');
    dot.setAttribute('cx', point.x);
    dot.setAttribute('cy', point.y);
    dot.setAttribute('r', '3');
    layer.append(dot);
  });

  const activePoint = createSvgElement('circle', 'history-active-point');
  activePoint.setAttribute('r', '7');
  layer.append(vertical, horizontal, activePoint);
  chart.append(layer);

  const tooltip = document.createElement('div');
  tooltip.className = 'history-chart-tooltip';
  tooltip.setAttribute('role', 'status');
  tooltip.setAttribute('aria-live', 'polite');
  figure.append(tooltip);

  let activeIndex = 2;

  const showPoint = (index) => {
    activeIndex = Math.max(0, Math.min(points.length - 1, index));
    const point = points[activeIndex];
    vertical.setAttribute('x1', point.x);
    vertical.setAttribute('x2', point.x);
    horizontal.setAttribute('y1', point.y);
    horizontal.setAttribute('y2', point.y);
    activePoint.setAttribute('cx', point.x);
    activePoint.setAttribute('cy', point.y);

    tooltip.innerHTML = `<time>${dates[activeIndex]}</time><strong>${Number(values[activeIndex]).toFixed(2)}%</strong><small>${notes[activeIndex]}</small>`;
    chart.classList.add('is-active');
    tooltip.classList.add('is-visible');

    const chartBox = chart.getBoundingClientRect();
    const figureBox = figure.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth || 126;
    let left = chartBox.left - figureBox.left + chartBox.width * (point.x / 760) + 12;
    if (left + tooltipWidth > figure.clientWidth - 5) {
      left = chartBox.left - figureBox.left + chartBox.width * (point.x / 760) - tooltipWidth - 12;
    }
    tooltip.style.left = `${Math.max(5, left)}px`;
    tooltip.style.top = `${chartBox.top - figureBox.top + chartBox.height * (point.y / 310)}px`;
  };

  const nearestIndex = (clientX) => {
    const svgPoint = chart.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = 0;
    const matrix = chart.getScreenCTM();
    if (!matrix) return activeIndex;
    const localX = svgPoint.matrixTransform(matrix.inverse()).x;
    return points.reduce((best, point, index) => (
      Math.abs(point.x - localX) < Math.abs(points[best].x - localX) ? index : best
    ), 0);
  };

  chart.setAttribute('tabindex', '0');
  chart.setAttribute('aria-label', 'Interactive U.S. 10-year Treasury yield chart for October 1987. Hover, tap, or use the left and right arrow keys to inspect each observation.');
  chart.addEventListener('pointerenter', (event) => showPoint(nearestIndex(event.clientX)));
  chart.addEventListener('pointermove', (event) => showPoint(nearestIndex(event.clientX)));
  chart.addEventListener('pointerdown', (event) => showPoint(nearestIndex(event.clientX)));
  chart.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch') return;
    chart.classList.remove('is-active');
    tooltip.classList.remove('is-visible');
  });
  chart.addEventListener('focus', () => showPoint(activeIndex));
  chart.addEventListener('blur', () => {
    chart.classList.remove('is-active');
    tooltip.classList.remove('is-visible');
  });
  chart.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showPoint(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });
});
