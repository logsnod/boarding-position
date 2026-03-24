import { getLineColor, LINES } from '../data/metro-lines.js';
import { createLineBadge, createMiniLineBadge } from './line-badge.js';
import { createMiniPosition } from './position-indicator.js';
import { voteEntry } from '../data/firestore-service.js';
import { getCurrentUser } from '../firebase.js';

export function createEntryCard(entry, { showVoting = true, onClick, userVotes = {} } = {}) {
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.style.borderLeftColor = getLineColor(entry.lineId);

  const lineColor = getLineColor(entry.lineId);

  // Info section
  const info = document.createElement('div');
  info.className = 'entry-info';

  // Route line
  const route = document.createElement('div');
  route.className = 'entry-route';
  route.innerHTML = `
    <span style="color:${lineColor};font-weight:800">${entry.lineId}</span>
    ${entry.boardingStation} → ${entry.goalStation}
  `;
  info.appendChild(route);

  // Direction
  const detail = document.createElement('div');
  detail.className = 'entry-detail';
  detail.textContent = `Direction: ${entry.direction}`;
  info.appendChild(detail);

  // Goal type
  const goalDetail = document.createElement('div');
  goalDetail.className = 'entry-detail';
  if (entry.goalType === 'transfer') {
    goalDetail.innerHTML = `Transfer to <strong>${entry.transferLine}</strong>`;
  } else {
    goalDetail.textContent = entry.exitDescription || 'Exit';
  }
  info.appendChild(goalDetail);

  // Notes
  if (entry.notes) {
    const notes = document.createElement('div');
    notes.className = 'entry-detail';
    notes.style.fontStyle = 'italic';
    notes.textContent = entry.notes;
    info.appendChild(notes);
  }

  // Contributor
  if (entry.createdByName) {
    const contrib = document.createElement('div');
    contrib.className = 'entry-detail';
    contrib.style.cssText = 'font-size:11px;margin-top:4px;';
    contrib.textContent = `by ${entry.createdByName}`;
    info.appendChild(contrib);
  }

  // Voting
  if (showVoting) {
    const voteSection = document.createElement('div');
    voteSection.className = 'vote-section';

    const upBtn = document.createElement('button');
    upBtn.className = `vote-btn ${userVotes[entry.id] === 1 ? 'voted' : ''}`;
    upBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`;
    upBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await voteEntry(entry.id, 1);
    });

    const count = document.createElement('span');
    count.className = 'vote-count';
    count.textContent = entry.upvotes || 0;

    const downBtn = document.createElement('button');
    downBtn.className = `vote-btn ${userVotes[entry.id] === -1 ? 'voted' : ''}`;
    downBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>`;
    downBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await voteEntry(entry.id, -1);
    });

    voteSection.appendChild(upBtn);
    voteSection.appendChild(count);
    voteSection.appendChild(downBtn);
    info.appendChild(voteSection);
  }

  card.appendChild(info);

  // Mini position indicator
  if (entry.position && entry.position.car) {
    const posEl = createMiniPosition(entry.position, lineColor);
    card.appendChild(posEl);
  }

  // Click handler for detail
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onClick(entry));
  }

  return card;
}

// Create the "recommended" variant
export function createRecommendedCard(entry, opts = {}) {
  const card = createEntryCard(entry, opts);
  const badge = document.createElement('span');
  badge.className = 'recommended-badge';
  badge.textContent = 'Recommended';
  card.querySelector('.entry-route')?.prepend(badge);
  card.querySelector('.entry-route')?.prepend(document.createTextNode(' '));
  return card;
}
