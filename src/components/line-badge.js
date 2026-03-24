import { getLineColor, getLineTextColor, isDarkText } from '../data/metro-lines.js';

export function createLineBadge(lineId, { size = 'normal', clickable = true, onClick } = {}) {
  const badge = document.createElement('button');
  badge.className = `line-badge ${size === 'large' ? 'large' : ''} ${isDarkText(lineId) ? 'dark-text' : ''}`;
  badge.style.backgroundColor = getLineColor(lineId);
  badge.innerHTML = `<span>${lineId}</span>`;

  if (!clickable) {
    badge.style.cursor = 'default';
    badge.disabled = true;
  }

  if (onClick) {
    badge.addEventListener('click', () => onClick(lineId));
  }

  return badge;
}

// Mini inline badge (no rotation, for use in text)
export function createMiniLineBadge(lineId) {
  const badge = document.createElement('span');
  badge.className = 'mini-badge';
  badge.style.backgroundColor = getLineColor(lineId);
  if (isDarkText(lineId)) badge.style.color = '#1a1a2e';
  badge.innerHTML = `<span>${lineId}</span>`;
  return badge;
}
