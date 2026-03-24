import { LINES, getLineIds, ALL_STATIONS, getLinesAtStation, getLineColor } from '../data/metro-lines.js';
import { subscribeFiltered, subscribeEntries, deleteEntry, getUserVotes } from '../data/firestore-service.js';
import { getCurrentUser } from '../firebase.js';
import { createLineBadge } from '../components/line-badge.js';
import { createEntryCard, createRecommendedCard } from '../components/entry-card.js';
import { navigate } from '../router.js';
import { showToast } from '../app-shell.js';

export function renderRecall(container, { query: routeQuery }) {
  let filters = {
    lineId: routeQuery.line || null,
    boardingStation: routeQuery.from ? decodeURIComponent(routeQuery.from) : (routeQuery.station ? decodeURIComponent(routeQuery.station) : null),
    direction: routeQuery.dir ? decodeURIComponent(routeQuery.dir) : null,
  };

  let currentUnsubscribe = null;
  let userVotes = {};

  async function loadVotes() {
    try {
      userVotes = await getUserVotes();
    } catch (e) {
      userVotes = {};
    }
  }

  function render() {
    container.innerHTML = `
      <div class="wizard-title">Find a Position</div>
      <div class="wizard-subtitle">Filter by line, station, and direction</div>

      <div class="filter-bar" id="filter-bar"></div>

      <div id="filter-controls" class="mb-md"></div>

      <div id="recall-results"></div>
    `;

    renderFilters();
    loadVotes().then(() => loadResults());
  }

  function renderFilters() {
    const controlsEl = document.getElementById('filter-controls');
    controlsEl.innerHTML = '';

    // Line filter
    const lineLabel = document.createElement('div');
    lineLabel.className = 'section-title';
    lineLabel.textContent = 'Line';
    controlsEl.appendChild(lineLabel);

    const lineGrid = document.createElement('div');
    lineGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;';
    getLineIds().forEach(lineId => {
      const badge = createLineBadge(lineId, {
        onClick: (id) => {
          filters.lineId = filters.lineId === id ? null : id;
          filters.direction = null;
          render();
        }
      });
      if (filters.lineId === lineId) {
        badge.style.outline = '3px solid var(--text-primary)';
        badge.style.outlineOffset = '3px';
      }
      lineGrid.appendChild(badge);
    });
    controlsEl.appendChild(lineGrid);

    // Station search (if line selected)
    if (filters.lineId) {
      const line = LINES[filters.lineId];
      if (line) {
        // Direction filter
        const dirLabel = document.createElement('div');
        dirLabel.className = 'section-title';
        dirLabel.textContent = 'Direction';
        controlsEl.appendChild(dirLabel);

        const dirPicker = document.createElement('div');
        dirPicker.className = 'direction-picker';
        dirPicker.style.marginBottom = '16px';

        line.terminals.forEach((terminal, idx) => {
          const btn = document.createElement('button');
          btn.className = `direction-btn ${filters.direction === terminal ? 'selected' : ''}`;
          btn.innerHTML = `<span class="arrow">${idx === 0 ? '←' : '→'}</span><span>${terminal}</span>`;
          btn.addEventListener('click', () => {
            filters.direction = filters.direction === terminal ? null : terminal;
            render();
          });
          dirPicker.appendChild(btn);
        });
        controlsEl.appendChild(dirPicker);

        // Station filter
        const stationLabel = document.createElement('div');
        stationLabel.className = 'section-title';
        stationLabel.textContent = 'Boarding Station';
        controlsEl.appendChild(stationLabel);

        const stationInput = document.createElement('input');
        stationInput.type = 'text';
        stationInput.placeholder = 'Filter by station...';
        stationInput.value = filters.boardingStation || '';
        stationInput.style.cssText = `
          width: 100%; padding: 8px 16px; border: 1px solid var(--border-color);
          border-radius: var(--radius-md); background: var(--bg-input); font-size: 15px;
          outline: none; margin-bottom: 8px;
        `;

        const stationDropdown = document.createElement('div');
        stationDropdown.style.display = 'none';

        stationInput.addEventListener('focus', () => {
          updateStationDropdown(stationInput.value);
          stationDropdown.style.display = 'block';
        });

        stationInput.addEventListener('input', () => {
          updateStationDropdown(stationInput.value);
          stationDropdown.style.display = 'block';
        });

        function updateStationDropdown(query) {
          const stations = line.stations.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase())
          );
          stationDropdown.innerHTML = '';
          stationDropdown.className = 'station-list';
          stationDropdown.style.maxHeight = '200px';
          stationDropdown.style.marginBottom = '16px';

          stations.forEach(station => {
            const item = document.createElement('div');
            item.className = `station-item ${filters.boardingStation === station.name ? 'selected' : ''}`;
            item.textContent = station.name;
            item.addEventListener('click', () => {
              filters.boardingStation = station.name;
              stationInput.value = station.name;
              stationDropdown.style.display = 'none';
              loadResults();
            });
            stationDropdown.appendChild(item);
          });
        }

        controlsEl.appendChild(stationInput);
        controlsEl.appendChild(stationDropdown);
      }
    } else if (filters.boardingStation && !filters.lineId) {
      // Station was set via search (from home page) without a specific line
      const stationLabel = document.createElement('div');
      stationLabel.className = 'section-title';
      stationLabel.textContent = `Entries for: ${filters.boardingStation}`;
      controlsEl.appendChild(stationLabel);
    }

    // Active filter chips
    const filterBar = document.getElementById('filter-bar');
    filterBar.innerHTML = '';

    if (filters.lineId) {
      const chip = createFilterChip(`${filters.lineId}`, () => {
        filters.lineId = null;
        filters.direction = null;
        render();
      });
      filterBar.appendChild(chip);
    }
    if (filters.direction) {
      const chip = createFilterChip(`→ ${filters.direction}`, () => {
        filters.direction = null;
        render();
      });
      filterBar.appendChild(chip);
    }
    if (filters.boardingStation) {
      const chip = createFilterChip(filters.boardingStation, () => {
        filters.boardingStation = null;
        render();
      });
      filterBar.appendChild(chip);
    }

    if (filters.lineId || filters.boardingStation || filters.direction) {
      const clearChip = document.createElement('button');
      clearChip.className = 'filter-chip';
      clearChip.textContent = 'Clear all';
      clearChip.style.color = 'var(--tmb-red)';
      clearChip.addEventListener('click', () => {
        filters = { lineId: null, boardingStation: null, direction: null };
        render();
      });
      filterBar.appendChild(clearChip);
    }
  }

  function createFilterChip(text, onRemove) {
    const chip = document.createElement('button');
    chip.className = 'filter-chip active';
    chip.innerHTML = `${text} ✕`;
    chip.addEventListener('click', onRemove);
    return chip;
  }

  function loadResults() {
    if (currentUnsubscribe) currentUnsubscribe();

    const resultsEl = document.getElementById('recall-results');
    if (!resultsEl) return;

    // If no filters, show all entries
    const hasFilters = filters.lineId || filters.boardingStation || filters.direction;

    const subscribeFn = hasFilters ? subscribeFiltered.bind(null, filters) : subscribeEntries;

    currentUnsubscribe = subscribeFn((entries) => {
      resultsEl.innerHTML = '';

      if (entries.length === 0) {
        resultsEl.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h3>No entries found</h3>
            <p>${hasFilters ? 'Try adjusting your filters or record a new entry' : 'Be the first to record a boarding position!'}</p>
          </div>
        `;
        return;
      }

      const sectionTitle = document.createElement('div');
      sectionTitle.className = 'section-title';
      sectionTitle.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} found`;
      resultsEl.appendChild(sectionTitle);

      entries.forEach((entry, idx) => {
        const isTop = idx === 0 && (entry.upvotes || 0) > 0;
        const card = isTop
          ? createRecommendedCard(entry, {
              userVotes,
              onClick: (e) => showEntryDetail(e)
            })
          : createEntryCard(entry, {
              userVotes,
              onClick: (e) => showEntryDetail(e)
            });
        resultsEl.appendChild(card);
      });
    });
  }

  function showEntryDetail(entry) {
    const user = getCurrentUser();
    const isOwner = user && entry.createdBy === user.uid;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.innerHTML = `
      <div class="modal-handle"></div>
      <div style="font-size:20px;font-weight:700;margin-bottom:16px;">
        <span style="color:${getLineColor(entry.lineId)}">${entry.lineId}</span>
        ${entry.boardingStation} → ${entry.goalStation}
      </div>
      <div style="font-size:14px;line-height:2;color:var(--text-secondary)">
        <div><strong>Direction:</strong> ${entry.direction}</div>
        <div><strong>Goal:</strong> ${entry.goalType === 'transfer' ? `Transfer to ${entry.transferLine}` : (entry.exitDescription || 'Exit')}</div>
        <div><strong>Position:</strong> Car ${entry.position?.car || '?'}, Door ${entry.position?.door || '?'} (${entry.position?.side || '?'} side)</div>
        ${entry.notes ? `<div><strong>Notes:</strong> ${entry.notes}</div>` : ''}
        <div><strong>Votes:</strong> ${entry.upvotes || 0}</div>
        <div><strong>By:</strong> ${entry.createdByName || 'Anonymous'}</div>
      </div>
      ${isOwner ? '<div id="owner-actions" style="margin-top:16px"></div>' : ''}
    `;

    if (isOwner) {
      setTimeout(() => {
        const actions = modal.querySelector('#owner-actions');
        if (actions) {
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn btn-outline';
          deleteBtn.style.cssText = 'color:#E23831;border-color:#E23831;width:100%;';
          deleteBtn.textContent = 'Delete This Entry';
          deleteBtn.addEventListener('click', async () => {
            if (confirm('Delete this boarding position entry?')) {
              await deleteEntry(entry.id);
              overlay.remove();
              showToast('Entry deleted');
            }
          });
          actions.appendChild(deleteBtn);
        }
      }, 0);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  render();

  return () => {
    if (currentUnsubscribe) currentUnsubscribe();
  };
}
