import { LINES, getLineIds, ALL_STATIONS, getLinesAtStation } from '../data/metro-lines.js';
import { subscribeEntries } from '../data/firestore-service.js';
import { createLineBadge } from '../components/line-badge.js';
import { createEntryCard } from '../components/entry-card.js';
import { navigate } from '../router.js';

export function renderHome(container) {
  container.innerHTML = `
    <div class="search-bar">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" id="home-search" placeholder="Search stations..." autocomplete="off">
    </div>
    <div id="search-results" style="display:none;margin-bottom:16px;"></div>
    <section class="mb-lg">
      <div class="section-title">Metro Lines</div>
      <div class="line-grid" id="line-grid"></div>
    </section>
    <section>
      <div class="section-title">Recent Entries</div>
      <div id="recent-entries"></div>
    </section>
  `;

  // Render line grid
  const grid = document.getElementById('line-grid');
  getLineIds().forEach(lineId => {
    const badge = createLineBadge(lineId, {
      size: 'large',
      onClick: (id) => navigate(`/record/${id}`)
    });
    grid.appendChild(badge);
  });

  // Subscribe to recent entries
  const unsubscribe = subscribeEntries((entries) => {
    const recentEl = document.getElementById('recent-entries');
    if (!recentEl) return;
    recentEl.innerHTML = '';

    const recent = entries.slice(0, 5);
    if (recent.length === 0) {
      recentEl.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <h3>No entries yet</h3>
          <p>Tap a line above or the + tab to record your first boarding position</p>
        </div>
      `;
      return;
    }

    recent.forEach(entry => {
      const card = createEntryCard(entry, {
        showVoting: false,
        onClick: () => navigate(`/recall?line=${entry.lineId}&from=${encodeURIComponent(entry.boardingStation)}&dir=${encodeURIComponent(entry.direction)}`)
      });
      recentEl.appendChild(card);
    });
  });

  // Search functionality
  const searchInput = document.getElementById('home-search');
  const searchResults = document.getElementById('search-results');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    const matches = ALL_STATIONS.filter(s => s.toLowerCase().includes(query)).slice(0, 8);
    if (matches.length === 0) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';
    searchResults.innerHTML = '';
    matches.forEach(stationName => {
      const item = document.createElement('div');
      item.className = 'station-item';
      item.style.cssText = 'border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:4px;';

      const name = document.createElement('span');
      name.textContent = stationName;
      item.appendChild(name);

      const lines = getLinesAtStation(stationName);
      if (lines.length > 0) {
        const badges = document.createElement('div');
        badges.className = 'transfer-badges';
        badges.style.marginLeft = 'auto';
        lines.forEach(line => {
          const mini = document.createElement('span');
          mini.className = 'mini-badge';
          mini.style.backgroundColor = line.color;
          if (line.textColor === '#1a1a2e') mini.style.color = '#1a1a2e';
          mini.innerHTML = `<span>${line.id}</span>`;
          badges.appendChild(mini);
        });
        item.appendChild(badges);
      }

      item.addEventListener('click', () => {
        navigate(`/recall?station=${encodeURIComponent(stationName)}`);
        searchInput.value = '';
        searchResults.style.display = 'none';
      });

      searchResults.appendChild(item);
    });
  });

  // Cleanup
  return () => {
    if (unsubscribe) unsubscribe();
  };
}
