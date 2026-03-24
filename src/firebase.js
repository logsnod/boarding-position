import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';

// Firebase config — replace with your own project config
// To set up: https://console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyCuAHCKWbGgCZSnc6yuuJV9m2oESOmTHWw",
  authDomain: "boarding-position.firebaseapp.com",
  projectId: "boarding-position",
  storageBucket: "boarding-position.firebasestorage.app",
  messagingSenderId: "821606578935",
  appId: "1:821606578935:web:4e29952ee70b99e87671f2"
};

let app;
let db;
let auth;
let currentUser = null;
const authListeners = [];

export async function initFirebase() {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Enable offline persistence
  try {
    await enableIndexedDbPersistence(db);
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence unavailable: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence unavailable: browser not supported');
    }
  }

  // Listen to auth state
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authListeners.forEach(fn => fn(user));
  });
}

export function getDb() {
  return db;
}

export function getCurrentUser() {
  return currentUser;
}

export function onAuthChange(callback) {
  authListeners.push(callback);
  // Call immediately with current state
  if (auth) {
    callback(currentUser);
  }
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx > -1) authListeners.splice(idx, 1);
  };
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') return null;
    console.error('Sign-in error:', error);
    throw error;
  }
}

export async function signOut() {
  await fbSignOut(auth);
}

// Check if Firebase is configured (not placeholder values)
export function isFirebaseConfigured() {
  return !firebaseConfig.apiKey.startsWith('YOUR_');
}
