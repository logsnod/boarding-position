import { getCurrentUser, onAuthChange, signInWithGoogle, signOut, isFirebaseConfigured } from '../firebase.js';
import { subscribeEntries } from '../data/firestore-service.js';
import { createEntryCard } from '../components/entry-card.js';
import { navigate } from '../router.js';
import { showToast } from '../app-shell.js';

export function renderProfile(container) {
  let unsubAuth = null;
  let unsubEntries = null;

  function render() {
    const user = getCurrentUser();
    container.innerHTML = '';

    if (!isFirebaseConfigured()) {
      container.innerHTML = `
        <div class="wizard-title">Profile</div>
        <div class="card mt-md">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">Demo Mode</h3>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">
            Firebase is not configured yet. The app is running in local-only mode.
            Your entries are saved to this device's browser storage.
          </p>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;margin-top:12px;">
            To enable cloud sync and sharing, set up a Firebase project and update
            the config in <code style="background:var(--bg-primary);padding:2px 6px;border-radius:4px;">src/firebase.js</code>
          </p>
        </div>
        <div class="card mt-md">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">Export Data</h3>
          <button class="btn btn-secondary mt-sm" id="export-btn" style="width:100%">Export as JSON</button>
        </div>
      `;

      document.getElementById('export-btn')?.addEventListener('click', exportData);
      return;
    }

    if (!user) {
      // Not signed in
      container.innerHTML = `
        <div class="empty-state" style="padding-top:48px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:80px;height:80px;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3 style="font-size:20px;">Sign in to contribute</h3>
          <p style="margin-bottom:24px;">Share your boarding position knowledge with other riders</p>
          <button class="btn btn-primary" id="profile-sign-in" style="max-width:280px;margin:0 auto;">
            Sign in with Google
          </button>
        </div>
      `;

      document.getElementById('profile-sign-in')?.addEventListener('click', async () => {
        try {
          await signInWithGoogle();
        } catch (e) {
          showToast('Sign in failed');
        }
      });
      return;
    }

    // Signed in
    container.innerHTML = `
      <div class="profile-header">
        ${user.photoURL
          ? `<img src="${user.photoURL}" class="profile-avatar" alt="${user.displayName}" referrerpolicy="no-referrer">`
          : `<div class="profile-avatar" style="background:var(--tmb-red);display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:700;">${(user.displayName || user.email || '?')[0].toUpperCase()}</div>`
        }
        <div>
          <div class="profile-name">${user.displayName || 'Metro Rider'}</div>
          <div class="profile-stats">${user.email || ''}</div>
        </div>
      </div>

      <div class="section-title">My Contributions</div>
      <div id="my-entries"></div>

      <div class="mt-lg">
        <button class="btn btn-secondary" id="export-btn" style="width:100%;margin-bottom:8px;">Export as JSON</button>
        <button class="btn btn-outline" id="sign-out-btn" style="width:100%;">Sign Out</button>
      </div>
    `;

    // Load user's entries
    unsubEntries = subscribeEntries((entries) => {
      const myEntries = entries.filter(e => e.createdBy === user.uid);
      const myEntriesEl = document.getElementById('my-entries');
      if (!myEntriesEl) return;

      myEntriesEl.innerHTML = '';
      if (myEntries.length === 0) {
        myEntriesEl.innerHTML = `
          <div class="empty-state">
            <h3>No contributions yet</h3>
            <p>Record your first boarding position to help other riders</p>
          </div>
        `;
        return;
      }

      const countEl = document.createElement('div');
      countEl.className = 'text-secondary mb-sm';
      countEl.style.fontSize = '14px';
      countEl.textContent = `${myEntries.length} ${myEntries.length === 1 ? 'entry' : 'entries'}`;
      myEntriesEl.appendChild(countEl);

      myEntries.forEach(entry => {
        const card = createEntryCard(entry, {
          showVoting: false,
          onClick: () => navigate(`/recall?line=${entry.lineId}&from=${encodeURIComponent(entry.boardingStation)}&dir=${encodeURIComponent(entry.direction)}`)
        });
        myEntriesEl.appendChild(card);
      });
    });

    document.getElementById('sign-out-btn')?.addEventListener('click', async () => {
      await signOut();
      showToast('Signed out');
      render();
    });

    document.getElementById('export-btn')?.addEventListener('click', exportData);
  }

  function exportData() {
    // Get data from local storage
    try {
      const data = localStorage.getItem('boarding-entries');
      if (!data || JSON.parse(data).length === 0) {
        showToast('No local data to export');
        return;
      }
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metro-bcn-entries-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported!');
    } catch (e) {
      showToast('Export failed');
    }
  }

  // Listen for auth changes
  unsubAuth = onAuthChange(() => {
    render();
  });

  render();

  return () => {
    if (unsubAuth) unsubAuth();
    if (unsubEntries) unsubEntries();
  };
}
