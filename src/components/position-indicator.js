import { getLineColor } from '../data/metro-lines.js';

const NUM_CARS = 5;
const DOORS_PER_CAR = 4;

// Create the interactive train position selector
export function createPositionIndicator(lineId, { onSelect, initialPosition } = {}) {
  const container = document.createElement('div');
  container.className = 'train-indicator';

  let selected = initialPosition || { car: null, door: null, side: 'left' };
  const lineColor = getLineColor(lineId);

  function render() {
    container.innerHTML = '';

    // Direction labels
    const dirLabel = document.createElement('div');
    dirLabel.style.cssText = 'display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);margin-bottom:4px;padding:0 4px;';
    dirLabel.innerHTML = `<span>&#9664; Front</span><span>Back &#9654;</span>`;
    container.appendChild(dirLabel);

    // SVG train
    const svgNS = 'http://www.w3.org/2000/svg';
    const carWidth = 100;
    const carGap = 8;
    const doorHeight = 18;
    const carHeight = 56;
    const totalWidth = NUM_CARS * carWidth + (NUM_CARS - 1) * carGap + 20;
    const svgHeight = carHeight + doorHeight * 2 + 30;

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${totalWidth} ${svgHeight}`);
    svg.setAttribute('class', 'train-svg');

    // Top-down view: front of train is on the left of the diagram.
    // "Left side" (from passenger POV facing front) = bottom of diagram.
    // "Right side" = top of diagram.
    const platformY = selected.side === 'right' ? 2 : carHeight + doorHeight * 2 + 10;
    const platformOtherY = selected.side === 'right' ? carHeight + doorHeight * 2 + 10 : 2;

    // Platform indicator (active side)
    const platform = document.createElementNS(svgNS, 'rect');
    platform.setAttribute('x', '5');
    platform.setAttribute('y', String(platformY));
    platform.setAttribute('width', String(totalWidth - 10));
    platform.setAttribute('height', '6');
    platform.setAttribute('rx', '3');
    platform.setAttribute('fill', lineColor);
    platform.setAttribute('opacity', '0.3');
    svg.appendChild(platform);

    // Platform label
    const platLabel = document.createElementNS(svgNS, 'text');
    platLabel.setAttribute('x', String(totalWidth / 2));
    platLabel.setAttribute('y', String(platformY + (selected.side === 'right' ? -1 : 14)));
    platLabel.setAttribute('text-anchor', 'middle');
    platLabel.setAttribute('font-size', '9');
    platLabel.setAttribute('fill', 'currentColor');
    platLabel.setAttribute('opacity', '0.5');
    platLabel.textContent = 'PLATFORM';
    svg.appendChild(platLabel);

    const trainY = 14;

    for (let car = 0; car < NUM_CARS; car++) {
      const x = 10 + car * (carWidth + carGap);

      // Car body
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', String(x));
      rect.setAttribute('y', String(trainY));
      rect.setAttribute('width', String(carWidth));
      rect.setAttribute('height', String(carHeight));
      rect.setAttribute('rx', '6');
      rect.setAttribute('fill', 'var(--bg-card)');
      rect.setAttribute('stroke', 'var(--border-color)');
      rect.setAttribute('stroke-width', '1.5');
      svg.appendChild(rect);

      // Car number
      const carText = document.createElementNS(svgNS, 'text');
      carText.setAttribute('x', String(x + carWidth / 2));
      carText.setAttribute('y', String(trainY + carHeight / 2 + 4));
      carText.setAttribute('text-anchor', 'middle');
      carText.setAttribute('font-size', '13');
      carText.setAttribute('font-weight', 'bold');
      carText.setAttribute('fill', 'var(--text-tertiary)');
      carText.textContent = `Car ${car + 1}`;
      svg.appendChild(carText);

      // Doors
      for (let door = 0; door < DOORS_PER_CAR; door++) {
        const doorWidth = 16;
        const doorSpacing = carWidth / (DOORS_PER_CAR + 1);
        const doorX = x + doorSpacing * (door + 1) - doorWidth / 2;

        // Door on platform side
        const isSelected = selected.car === car + 1 && selected.door === door + 1;

        const doorRect = document.createElementNS(svgNS, 'rect');
        const doorSideY = selected.side === 'right' ? trainY - doorHeight + 1 : trainY + carHeight - 1;
        doorRect.setAttribute('x', String(doorX));
        doorRect.setAttribute('y', String(doorSideY));
        doorRect.setAttribute('width', String(doorWidth));
        doorRect.setAttribute('height', String(doorHeight));
        doorRect.setAttribute('rx', '2');
        doorRect.setAttribute('fill', isSelected ? lineColor : 'var(--border-color)');
        doorRect.setAttribute('stroke', isSelected ? lineColor : 'none');
        doorRect.setAttribute('stroke-width', isSelected ? '2' : '0');
        doorRect.style.cursor = 'pointer';
        doorRect.style.transition = 'fill 0.15s';

        if (isSelected) {
          // Pulse animation
          const anim = document.createElementNS(svgNS, 'animate');
          anim.setAttribute('attributeName', 'opacity');
          anim.setAttribute('values', '1;0.6;1');
          anim.setAttribute('dur', '1.5s');
          anim.setAttribute('repeatCount', 'indefinite');
          doorRect.appendChild(anim);
        }

        const carNum = car + 1;
        const doorNum = door + 1;
        doorRect.addEventListener('click', () => {
          selected.car = carNum;
          selected.door = doorNum;
          if (onSelect) onSelect({ ...selected });
          render();
        });

        svg.appendChild(doorRect);

        // Door label for selected
        if (isSelected) {
          const label = document.createElementNS(svgNS, 'text');
          const labelY = selected.side === 'right' ? doorSideY - 3 : doorSideY + doorHeight + 8;
          label.setAttribute('x', String(doorX + doorWidth / 2));
          label.setAttribute('y', String(labelY));
          label.setAttribute('text-anchor', 'middle');
          label.setAttribute('font-size', '9');
          label.setAttribute('font-weight', 'bold');
          label.setAttribute('fill', lineColor);
          label.textContent = `D${doorNum}`;
          svg.appendChild(label);
        }
      }
    }

    container.appendChild(svg);

    // Selection summary
    if (selected.car && selected.door) {
      const summary = document.createElement('div');
      summary.className = 'text-center mt-sm';
      summary.style.cssText = 'font-size:14px;font-weight:600;';
      summary.innerHTML = `Car <strong>${selected.car}</strong>, Door <strong>${selected.door}</strong> (${selected.side} side)`;
      container.appendChild(summary);
    }

    // Side toggle
    const sideToggle = document.createElement('div');
    sideToggle.className = 'side-toggle';

    ['left', 'right'].forEach(side => {
      const btn = document.createElement('button');
      btn.textContent = `${side.charAt(0).toUpperCase() + side.slice(1)} side`;
      btn.className = selected.side === side ? 'selected' : '';
      btn.addEventListener('click', () => {
        selected.side = side;
        if (onSelect) onSelect({ ...selected });
        render();
      });
      sideToggle.appendChild(btn);
    });

    container.appendChild(sideToggle);
  }

  render();
  return container;
}

// Create a mini read-only train position display for entry cards
export function createMiniPosition(position, lineColor) {
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;';

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 60 20');
  svg.setAttribute('width', '60');
  svg.setAttribute('height', '20');

  // Mini cars
  for (let car = 0; car < NUM_CARS; car++) {
    const x = car * 12;
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', String(x + 1));
    rect.setAttribute('y', '2');
    rect.setAttribute('width', '10');
    rect.setAttribute('height', '16');
    rect.setAttribute('rx', '2');
    rect.setAttribute('fill', position.car === car + 1 ? lineColor : 'var(--border-color)');
    rect.setAttribute('opacity', position.car === car + 1 ? '1' : '0.4');
    svg.appendChild(rect);
  }

  container.appendChild(svg);

  const label = document.createElement('span');
  label.style.cssText = 'font-size:10px;font-weight:700;color:var(--text-secondary);';
  label.textContent = `C${position.car} D${position.door} ${position.side === 'left' ? 'L' : 'R'}`;
  container.appendChild(label);

  return container;
}
