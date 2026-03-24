import './styles/reset.css';
import './styles/variables.css';
import './styles/app.css';
import { initFirebase } from './firebase.js';
import { createRouter } from './router.js';
import { renderAppShell } from './app-shell.js';

async function init() {
  const app = document.getElementById('app');
  renderAppShell(app);
  await initFirebase();
  createRouter();
}

init();
