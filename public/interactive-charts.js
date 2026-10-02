(() => {
  const svgNamespace = 'http://www.w3.org/2000/svg';

  const parsePoints = (value) => value.trim().split(/\s+/).map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return { x, y };
  });

  const createSvgElement = (name, className) => {
    const element = document.createElementNS(svgNamespace, name);
    element.setAttribute('class', className);
    return element;
  };

  document.querySelectorAll('.interactive-chart').forEach((chart) => {
    const line = chart.querySelector('polyline.line');
    const values = chart.dataset.values.split(',');
    const dates = chart.dataset.dates.split(',');
    const points = parsePoints(line.getAttribute('points'));
    const unit = chart.dataset.unit || '';
    const decimals = Number(chart.dataset.decimals || 2);

    if (points.length !== values.length || points.length !== dates.length) return;

    const layer = createSvgElement('g', 'chart-interaction-layer');
    const vertical = createSvgElement('line', 'crosshair crosshair-vertical');
    const horizontal = createSvgElement('line', 'crosshair crosshair-horizontal');
    vertical.setAttribute('y1', '25');
    vertical.setAttribute('y2', '145');
    horizontal.setAttribute('x1', '35');
    horizontal.setAttribute('x2', '330');

    points.forEach((point) => {
      const dot = createSvgElement('circle', 'hover-point');
      dot.setAttribute('cx', point.x);
      dot.setAttribute('cy', point.y);
      dot.setAttribute('r', '2.5');
      layer.append(dot);
    });

    const activePoint = createSvgElement('circle', 'active-point');
    activePoint.setAttribute('r', '5');
    layer.append(vertical, horizontal, activePoint);
    chart.append(layer);

    const wrapper = chart.closest('.chart-wrap');
    wrapper.classList.add('has-interactive-chart');
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.setAttribute('role', 'status');
    tooltip.setAttribute('aria-live', 'polite');
    wrapper.append(tooltip);

    let activeIndex = points.length - 1;

    const showPoint = (index) => {
      activeIndex = Math.max(0, Math.min(points.length - 1, index));
      const point = points[activeIndex];
      vertical.setAttribute('x1', point.x);
      vertical.setAttribute('x2', point.x);
      horizontal.setAttribute('y1', point.y);
      horizontal.setAttribute('y2', point.y);
      activePoint.setAttribute('cx', point.x);
      activePoint.setAttribute('cy', point.y);

      const value = Number(values[activeIndex]).toFixed(decimals);
      tooltip.innerHTML = `<time>${dates[activeIndex]}</time><strong>${unit}${value}${chart.dataset.suffix || ''}</strong>`;
      tooltip.classList.add('is-visible');
      chart.classList.add('is-active');

      const chartBox = chart.getBoundingClientRect();
      const wrapperBox = wrapper.getBoundingClientRect();
      const xRatio = point.x / 360;
      const yRatio = point.y / 190;
      const tooltipWidth = tooltip.offsetWidth || 92;
      let left = chartBox.left - wrapperBox.left + chartBox.width * xRatio + 12;
      if (left + tooltipWidth > wrapper.clientWidth - 4) {
        left = chartBox.left - wrapperBox.left + chartBox.width * xRatio - tooltipWidth - 12;
      }
      tooltip.style.left = `${Math.max(4, left)}px`;
      tooltip.style.top = `${chartBox.top - wrapperBox.top + chartBox.height * yRatio}px`;
    };

    const nearestIndex = (clientX) => {
      const svgPoint = chart.createSVGPoint();
      svgPoint.x = clientX;
      svgPoint.y = 0;
      const localX = svgPoint.matrixTransform(chart.getScreenCTM().inverse()).x;
      return points.reduce((best, point, index) => (
        Math.abs(point.x - localX) < Math.abs(points[best].x - localX) ? index : best
      ), 0);
    };

    chart.setAttribute('tabindex', '0');
    chart.setAttribute('aria-label', `${chart.getAttribute('aria-label') || 'Interactive market chart'}. Hover, tap, or use the left and right arrow keys to inspect each observation.`);
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
})();
