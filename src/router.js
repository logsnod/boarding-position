import { renderHome } from './views/home.js';
import { renderRecord } from './views/record.js';
import { renderRecall } from './views/recall.js';
import { renderProfile } from './views/profile.js';

const routes = {
  '': renderHome,
  'record': renderRecord,
  'recall': renderRecall,
  'profile': renderProfile,
};

let currentCleanup = null;

function getRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);
  const route = parts[0] || '';
  const params = parts.slice(1);
  // Parse query params
  const queryIdx = (parts[parts.length - 1] || '').indexOf('?');
  let query = {};
  if (queryIdx > -1) {
    const lastPart = parts[parts.length - 1];
    params[params.length - 1] = lastPart.slice(0, queryIdx);
    const searchParams = new URLSearchParams(lastPart.slice(queryIdx + 1));
    for (const [key, value] of searchParams) {
      query[key] = value;
    }
  }
  return { route, params, query };
}

function handleRoute() {
  const { route, params, query } = getRoute();
  const content = document.getElementById('main-content');
  if (!content) return;

  // Cleanup previous view
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const renderer = routes[route] || renderHome;
  content.innerHTML = '';
  currentCleanup = renderer(content, { params, query }) || null;

  // Update active tab
  document.querySelectorAll('.tab-bar-item').forEach(item => {
    const tabRoute = item.dataset.route || '';
    item.classList.toggle('active', tabRoute === route);
  });
}

export function createRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function navigate(path) {
  window.location.hash = path;
}
