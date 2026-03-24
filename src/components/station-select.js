import { LINES, getLineColor } from '../data/metro-lines.js';
import { createMiniLineBadge } from './line-badge.js';

export function createStationSelect(lineId, { direction, onSelect, exclude, label = 'Select a station' } = {}) {
  const container = document.createElement('div');
  const line = LINES[lineId];
  if (!line) return container;

  let stations = [...line.stations];

  // If direction specified, order stations in travel direction
  if (direction === line.terminals[0]) {
    stations = stations.reverse();
  }

  // Exclude specific stations
  if (exclude) {
    stations = stations.filter(s => !exclude.includes(s.name));
  }

  // Search filter
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = `Search stations on ${lineId}...`;
  searchInput.style.cssText = `
    width: 100%; padding: 8px 16px; border: 1px solid var(--border-color);
    border-radius: var(--radius-md); background: var(--bg-input); font-size: 15px;
    outline: none; margin-bottom: 8px;
  `;

  const list = document.createElement('div');
  list.className = 'station-list';

  function renderStations(filter = '') {
    list.innerHTML = '';
    const filtered = stations.filter(s =>
      s.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      list.innerHTML = '<div class="station-item" style="color:var(--text-tertiary)">No stations found</div>';
      return;
    }

    filtered.forEach(station => {
      const item = document.createElement('div');
      item.className = 'station-item';

      const name = document.createElement('span');
      name.textContent = station.name;
      item.appendChild(name);

      if (station.transfers.length > 0) {
        const badges = document.createElement('div');
        badges.className = 'transfer-badges';
        station.transfers.forEach(tLine => {
          badges.appendChild(createMiniLineBadge(tLine));
        });
        item.appendChild(badges);
      }

      item.addEventListener('click', () => {
        if (onSelect) onSelect(station);
        // Highlight selected
        list.querySelectorAll('.station-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
      });

      list.appendChild(item);
    });
  }

  searchInput.addEventListener('input', () => {
    renderStations(searchInput.value);
  });

  renderStations();

  container.appendChild(searchInput);
  container.appendChild(list);
  return container;
}
