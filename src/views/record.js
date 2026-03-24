import { LINES, getLineIds } from '../data/metro-lines.js';
import { saveEntry } from '../data/firestore-service.js';
import { getCurrentUser } from '../firebase.js';
import { createLineBadge } from '../components/line-badge.js';
import { createStationSelect } from '../components/station-select.js';
import { createPositionIndicator } from '../components/position-indicator.js';
import { navigate } from '../router.js';
import { showToast } from '../app-shell.js';

const TOTAL_STEPS = 6;

export function renderRecord(container, { params }) {
  const preselectedLine = params[0] || null;

  const state = {
    step: preselectedLine ? 2 : 1,
    lineId: preselectedLine,
    direction: null,
    goalStation: null,
    goalType: 'transfer',
    transferLine: null,
    exitDirection: null,
    singleExit: false,
    exitDescription: '',
    position: { car: null, door: null, side: 'left' },
    notes: '',
  };

  function render() {
    container.innerHTML = '';

    // Progress bar
    const progress = document.createElement('div');
    progress.className = 'wizard-progress';
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const dot = document.createElement('div');
      dot.className = `step-dot ${i < state.step ? 'done' : ''} ${i === state.step ? 'current' : ''}`;
      progress.appendChild(dot);
    }
    container.appendChild(progress);

    const stepEl = document.createElement('div');
    stepEl.className = 'wizard-step active';

    switch (state.step) {
      case 1: renderLineStep(stepEl); break;
      case 2: renderDirectionStep(stepEl); break;
      case 3: renderGoalStationStep(stepEl); break;
      case 4: renderGoalTypeStep(stepEl); break;
      case 5: renderPositionStep(stepEl); break;
      case 6: renderNotesStep(stepEl); break;
    }

    container.appendChild(stepEl);
  }

  function renderLineStep(el) {
    el.innerHTML = `
      <div class="wizard-title">Which line?</div>
      <div class="wizard-subtitle">Select the metro line you're taking</div>
      <div class="line-grid" id="wizard-lines"></div>
    `;
    const grid = el.querySelector('#wizard-lines');
    getLineIds().forEach(lineId => {
      const badge = createLineBadge(lineId, {
        size: 'large',
        onClick: (id) => {
          state.lineId = id;
          state.step = 2;
          // Reset downstream selections
          state.direction = null;
          state.goalStation = null;
          render();
        }
      });
      grid.appendChild(badge);
    });
  }

  function renderDirectionStep(el) {
    const line = LINES[state.lineId];
    if (!line) return;

    el.innerHTML = `
      <div class="wizard-title">Which direction?</div>
      <div class="wizard-subtitle">Select the terminal station you're heading toward</div>
      <div class="direction-picker" id="dir-picker"></div>
    `;

    const picker = el.querySelector('#dir-picker');
    line.terminals.forEach((terminal, idx) => {
      const btn = document.createElement('button');
      btn.className = `direction-btn ${state.direction === terminal ? 'selected' : ''}`;
      btn.innerHTML = `
        <span class="arrow">${idx === 0 ? '←' : '→'}</span>
        <span>${terminal}</span>
      `;
      btn.addEventListener('click', () => {
        state.direction = terminal;
        state.goalStation = null;
        state.step = 3;
        render();
      });
      picker.appendChild(btn);
    });

    addNavButtons(el, { back: true, backStep: 1 });
  }

  function renderGoalStationStep(el) {
    el.innerHTML = `
      <div class="wizard-title">Where are you going?</div>
      <div class="wizard-subtitle">Select your destination station on ${state.lineId}</div>
    `;

    const stationSelect = createStationSelect(state.lineId, {
      direction: state.direction,
      onSelect: (station) => {
        state.goalStation = station.name;
        // Pre-check transfers
        if (station.transfers.length > 0) {
          state.goalType = 'transfer';
          state.transferLine = station.transfers[0];
        }
      }
    });
    el.appendChild(stationSelect);

    addNavButtons(el, {
      back: true,
      backStep: 2,
      next: true,
      nextLabel: 'Next',
      onNext: () => {
        if (!state.goalStation) {
          showToast('Please select a destination');
          return false;
        }
        state.step = 4;
        render();
        return true;
      }
    });
  }

  function renderGoalTypeStep(el) {
    const line = LINES[state.lineId];
    const goalStation = line?.stations.find(s => s.name === state.goalStation);
    const transfers = goalStation?.transfers || [];

    el.innerHTML = `
      <div class="wizard-title">What's your goal?</div>
      <div class="wizard-subtitle">What are you doing at ${state.goalStation}?</div>
    `;

    // Goal type toggle
    const toggle = document.createElement('div');
    toggle.className = 'goal-type-toggle';

    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'Exit Station';
    exitBtn.className = state.goalType === 'exit' ? 'selected' : '';
    exitBtn.addEventListener('click', () => {
      state.goalType = 'exit';
      state.transferLine = null;
      render();
    });

    const transferBtn = document.createElement('button');
    transferBtn.textContent = 'Transfer';
    transferBtn.className = state.goalType === 'transfer' ? 'selected' : '';
    transferBtn.addEventListener('click', () => {
      state.goalType = 'transfer';
      render();
    });

    toggle.appendChild(exitBtn);
    toggle.appendChild(transferBtn);
    el.appendChild(toggle);

    if (state.goalType === 'transfer') {
      if (transfers.length > 0) {
        const label = document.createElement('div');
        label.className = 'wizard-subtitle';
        label.textContent = 'Transfer to which line?';
        el.appendChild(label);

        const lineGrid = document.createElement('div');
        lineGrid.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;justify-content:center;padding:8px 0;';
        transfers.forEach(tLine => {
          const badge = createLineBadge(tLine, {
            size: 'large',
            onClick: () => {
              state.transferLine = tLine;
              // Update selection visual
              lineGrid.querySelectorAll('.line-badge').forEach(b => {
                b.style.outline = 'none';
              });
              badge.style.outline = '3px solid var(--text-primary)';
              badge.style.outlineOffset = '4px';
            }
          });
          if (state.transferLine === tLine) {
            badge.style.outline = '3px solid var(--text-primary)';
            badge.style.outlineOffset = '4px';
          }
          lineGrid.appendChild(badge);
        });
        el.appendChild(lineGrid);
      }

      // Manual line input if no auto-detected transfers
      if (transfers.length === 0) {
        const manualLabel = document.createElement('div');
        manualLabel.className = 'wizard-subtitle';
        manualLabel.textContent = 'Enter the line to transfer to:';
        el.appendChild(manualLabel);

        const select = document.createElement('div');
        select.className = 'select-wrapper';
        const sel = document.createElement('select');
        sel.innerHTML = `<option value="">Select a line</option>`;
        getLineIds().filter(id => id !== state.lineId).forEach(id => {
          sel.innerHTML += `<option value="${id}" ${state.transferLine === id ? 'selected' : ''}>${id}</option>`;
        });
        sel.addEventListener('change', () => {
          state.transferLine = sel.value || null;
        });
        select.appendChild(sel);
        el.appendChild(select);
      }
    } else {
      // Exit direction options
      const dirLabel = document.createElement('div');
      dirLabel.className = 'wizard-subtitle mt-md';
      dirLabel.textContent = 'Which direction do you want to exit? (optional)';
      el.appendChild(dirLabel);

      const dirGrid = document.createElement('div');
      dirGrid.className = 'exit-dir-grid';
      ['North', 'South', 'East', 'West'].forEach(dir => {
        const btn = document.createElement('button');
        btn.className = `exit-dir-btn ${state.exitDirection === dir.toLowerCase() ? 'selected' : ''}`;
        btn.textContent = dir;
        btn.addEventListener('click', () => {
          if (state.exitDirection === dir.toLowerCase()) {
            state.exitDirection = null;
          } else {
            state.exitDirection = dir.toLowerCase();
          }
          render();
        });
        dirGrid.appendChild(btn);
      });
      el.appendChild(dirGrid);

      // Single exit checkbox
      const singleExitLabel = document.createElement('label');
      singleExitLabel.className = 'single-exit-toggle';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = state.singleExit;
      checkbox.addEventListener('change', () => {
        state.singleExit = checkbox.checked;
      });
      singleExitLabel.appendChild(checkbox);
      singleExitLabel.appendChild(document.createTextNode('Single exit only'));
      el.appendChild(singleExitLabel);

      // Optional details
      const detailsInput = document.createElement('input');
      detailsInput.type = 'text';
      detailsInput.className = 'notes-input';
      detailsInput.placeholder = 'Additional details (optional), e.g., "near the escalator"';
      detailsInput.value = state.exitDescription;
      detailsInput.addEventListener('input', () => {
        state.exitDescription = detailsInput.value;
      });
      el.appendChild(detailsInput);
    }

    addNavButtons(el, {
      back: true,
      backStep: 3,
      next: true,
      nextLabel: 'Next',
      onNext: () => {
        if (state.goalType === 'transfer' && !state.transferLine) {
          showToast('Please select a transfer line');
          return false;
        }
        state.step = 5;
        render();
        return true;
      }
    });
  }

  function renderPositionStep(el) {
    el.innerHTML = `
      <div class="wizard-title">Where to stand?</div>
      <div class="wizard-subtitle">Tap the door closest to where you need to exit at ${state.goalStation}</div>
    `;

    const indicator = createPositionIndicator(state.lineId, {
      initialPosition: state.position,
      onSelect: (pos) => {
        state.position = pos;
      }
    });
    el.appendChild(indicator);

    addNavButtons(el, {
      back: true,
      backStep: 4,
      next: true,
      nextLabel: 'Next',
      onNext: () => {
        if (!state.position.car || !state.position.door) {
          showToast('Please tap a door on the train');
          return false;
        }
        state.step = 6;
        render();
        return true;
      }
    });
  }

  function renderNotesStep(el) {
    el.innerHTML = `
      <div class="wizard-title">Any notes?</div>
      <div class="wizard-subtitle">Add landmarks or tips to help find the right spot</div>
    `;

    const notesInput = document.createElement('textarea');
    notesInput.className = 'notes-input';
    notesInput.placeholder = 'e.g., "Align with the 3rd advertising panel" or "Near the bench with the mosaic"';
    notesInput.value = state.notes;
    notesInput.style.minHeight = '100px';
    notesInput.addEventListener('input', () => {
      state.notes = notesInput.value;
    });
    el.appendChild(notesInput);

    // Build exit info for summary
    let exitInfo = `Exit at <strong>${state.goalStation}</strong>`;
    if (state.exitDirection) exitInfo += ` (${state.exitDirection})`;
    if (state.singleExit) exitInfo += ' &middot; single exit';
    if (state.exitDescription) exitInfo += ` &mdash; ${state.exitDescription}`;

    // Summary card
    const summary = document.createElement('div');
    summary.className = 'card mt-lg';
    summary.innerHTML = `
      <div class="section-title">Summary</div>
      <div style="font-size:14px;line-height:1.8">
        <strong style="color:${LINES[state.lineId]?.color}">${state.lineId}</strong>
        direction <strong>${state.direction}</strong><br>
        ${state.goalType === 'transfer'
          ? `Transfer to <strong>${state.transferLine}</strong> at <strong>${state.goalStation}</strong>`
          : exitInfo
        }<br>
        Stand at <strong>Car ${state.position.car}, Door ${state.position.door}</strong> (${state.position.side} side)
      </div>
    `;
    el.appendChild(summary);

    addNavButtons(el, {
      back: true,
      backStep: 5,
      next: true,
      nextLabel: 'Save Entry',
      onNext: async () => {
        try {
          await saveEntry(state);
          showToast('Boarding position saved!');
          navigate('/');
        } catch (err) {
          console.error('Save error:', err);
          showToast('Error saving — try again');
        }
        return true;
      }
    });
  }

  function addNavButtons(el, { back, backStep, next, nextLabel, onNext }) {
    const nav = document.createElement('div');
    nav.className = 'wizard-nav';

    if (back) {
      const backBtn = document.createElement('button');
      backBtn.className = 'btn btn-secondary';
      backBtn.textContent = 'Back';
      backBtn.addEventListener('click', () => {
        state.step = backStep;
        render();
      });
      nav.appendChild(backBtn);
    }

    if (next) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.textContent = nextLabel || 'Next';
      nextBtn.addEventListener('click', async () => {
        if (onNext) await onNext();
      });
      nav.appendChild(nextBtn);
    }

    el.appendChild(nav);
  }

  render();
}
