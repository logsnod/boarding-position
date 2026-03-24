import { onAuthChange, signInWithGoogle, isFirebaseConfigured } from './firebase.js';

const LOGO_SVG = `<svg viewBox="0 0 100 100" class="logo">
  <rect x="15" y="15" width="70" height="70" rx="8" fill="white" transform="rotate(45 50 50)"/>
  <text x="50" y="68" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="bold" font-size="52" fill="#E23831">M</text>
</svg>`;

const TAB_ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  record: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  recall: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

export function renderAppShell(container) {
  container.innerHTML = `
    <header class="app-header">
      ${LOGO_SVG}
      <h1>Metro BCN</h1>
      <div class="header-auth" id="header-auth"></div>
    </header>
    <main class="app-content" id="main-content"></main>
    <nav class="tab-bar">
      <a href="#/" class="tab-bar-item active" data-route="">
        ${TAB_ICONS.home}
        <span>Home</span>
      </a>
      <a href="#/record" class="tab-bar-item record-tab" data-route="record">
        ${TAB_ICONS.record}
        <span>Record</span>
      </a>
      <a href="#/recall" class="tab-bar-item" data-route="recall">
        ${TAB_ICONS.recall}
        <span>Recall</span>
      </a>
      <a href="#/profile" class="tab-bar-item" data-route="profile">
        ${TAB_ICONS.profile}
        <span>Profile</span>
      </a>
    </nav>
    <div class="toast" id="toast"></div>
  `;

  // Auth button in header
  const authEl = document.getElementById('header-auth');
  if (isFirebaseConfigured()) {
    onAuthChange((user) => {
      if (user) {
        authEl.innerHTML = user.photoURL
          ? `<img src="${user.photoURL}" alt="${user.displayName}" referrerpolicy="no-referrer">`
          : `<div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${(user.displayName || user.email || '?')[0].toUpperCase()}</div>`;
      } else {
        authEl.innerHTML = `<button class="sign-in-btn" id="sign-in-btn">Sign In</button>`;
        document.getElementById('sign-in-btn')?.addEventListener('click', () => {
          signInWithGoogle();
        });
      }
    });
  }
}

export function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), duration);
}
