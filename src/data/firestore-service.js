import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  setDoc, increment, getDocs
} from 'firebase/firestore';
import { getDb, getCurrentUser, isFirebaseConfigured } from '../firebase.js';

const ENTRIES_COL = 'boardingPositions';
const VOTES_COL = 'votes';

// In-memory cache for when Firebase is not configured (demo/local mode)
let localEntries = [];
let localIdCounter = 1;
let listeners = [];

function notifyListeners() {
  listeners.forEach(fn => fn([...localEntries]));
}

// Save a new boarding position entry
export async function saveEntry(data) {
  const user = getCurrentUser();

  const entry = {
    lineId: data.lineId,
    direction: data.direction,
    boardingStation: data.boardingStation,
    goalStation: data.goalStation,
    goalType: data.goalType,
    transferLine: data.transferLine || null,
    exitDescription: data.exitDescription || '',
    position: {
      car: data.position.car,
      door: data.position.door,
      side: data.position.side,
    },
    notes: data.notes || '',
    upvotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: user?.uid || 'anonymous',
    createdByName: user?.displayName || 'Anonymous',
    createdByPhoto: user?.photoURL || null,
  };

  if (isFirebaseConfigured()) {
    const db = getDb();
    entry.createdAt = serverTimestamp();
    entry.updatedAt = serverTimestamp();
    const ref = await addDoc(collection(db, ENTRIES_COL), entry);
    return ref.id;
  } else {
    // Local fallback
    entry.id = String(localIdCounter++);
    localEntries.push(entry);
    saveToLocalStorage();
    notifyListeners();
    return entry.id;
  }
}

// Update an existing entry
export async function updateEntry(id, data) {
  if (isFirebaseConfigured()) {
    const db = getDb();
    await updateDoc(doc(db, ENTRIES_COL, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    const idx = localEntries.findIndex(e => e.id === id);
    if (idx > -1) {
      localEntries[idx] = { ...localEntries[idx], ...data, updatedAt: new Date().toISOString() };
      saveToLocalStorage();
      notifyListeners();
    }
  }
}

// Delete an entry
export async function deleteEntry(id) {
  if (isFirebaseConfigured()) {
    const db = getDb();
    await deleteDoc(doc(db, ENTRIES_COL, id));
  } else {
    localEntries = localEntries.filter(e => e.id !== id);
    saveToLocalStorage();
    notifyListeners();
  }
}

// Subscribe to all entries (real-time)
export function subscribeEntries(callback) {
  if (isFirebaseConfigured()) {
    const db = getDb();
    const q = query(collection(db, ENTRIES_COL), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(entries);
    }, (error) => {
      console.error('Firestore subscription error:', error);
    });
  } else {
    // Local fallback
    loadFromLocalStorage();
    callback([...localEntries]);
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(fn => fn !== callback);
    };
  }
}

// Query entries by line and optionally station/direction
export function subscribeFiltered({ lineId, boardingStation, direction }, callback) {
  if (isFirebaseConfigured()) {
    const db = getDb();
    const constraints = [orderBy('upvotes', 'desc')];
    if (lineId) constraints.unshift(where('lineId', '==', lineId));
    if (boardingStation) constraints.unshift(where('boardingStation', '==', boardingStation));
    if (direction) constraints.unshift(where('direction', '==', direction));

    const q = query(collection(db, ENTRIES_COL), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(entries);
    });
  } else {
    loadFromLocalStorage();
    const filtered = localEntries.filter(e => {
      if (lineId && e.lineId !== lineId) return false;
      if (boardingStation && e.boardingStation !== boardingStation) return false;
      if (direction && e.direction !== direction) return false;
      return true;
    }).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    callback(filtered);
    const wrappedCb = () => {
      const f = localEntries.filter(e => {
        if (lineId && e.lineId !== lineId) return false;
        if (boardingStation && e.boardingStation !== boardingStation) return false;
        if (direction && e.direction !== direction) return false;
        return true;
      }).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      callback(f);
    };
    listeners.push(wrappedCb);
    return () => {
      listeners = listeners.filter(fn => fn !== wrappedCb);
    };
  }
}

// Vote on an entry
export async function voteEntry(entryId, value) {
  const user = getCurrentUser();
  const uid = user?.uid || 'anonymous';
  const voteId = `${uid}_${entryId}`;

  if (isFirebaseConfigured()) {
    const db = getDb();
    const voteRef = doc(db, VOTES_COL, voteId);
    const voteSnap = await getDoc(voteRef);
    const entryRef = doc(db, ENTRIES_COL, entryId);

    if (voteSnap.exists()) {
      const existingValue = voteSnap.data().value;
      if (existingValue === value) {
        // Remove vote (toggle off)
        await deleteDoc(voteRef);
        await updateDoc(entryRef, { upvotes: increment(-value) });
        return 0;
      } else {
        // Change vote
        await setDoc(voteRef, { visitorUid: uid, positionId: entryId, value, createdAt: serverTimestamp() });
        await updateDoc(entryRef, { upvotes: increment(value - existingValue) });
        return value;
      }
    } else {
      // New vote
      await setDoc(voteRef, { visitorUid: uid, positionId: entryId, value, createdAt: serverTimestamp() });
      await updateDoc(entryRef, { upvotes: increment(value) });
      return value;
    }
  } else {
    // Local fallback
    const entry = localEntries.find(e => e.id === entryId);
    if (entry) {
      entry.upvotes = (entry.upvotes || 0) + value;
      saveToLocalStorage();
      notifyListeners();
    }
    return value;
  }
}

// Get user's votes (to show vote state in UI)
export async function getUserVotes() {
  const user = getCurrentUser();
  const uid = user?.uid || 'anonymous';

  if (isFirebaseConfigured()) {
    const db = getDb();
    const q = query(collection(db, VOTES_COL), where('visitorUid', '==', uid));
    const snap = await getDocs(q);
    const votes = {};
    snap.docs.forEach(d => {
      const data = d.data();
      votes[data.positionId] = data.value;
    });
    return votes;
  } else {
    return {};
  }
}

// Local storage helpers for demo/offline-only mode
function saveToLocalStorage() {
  try {
    localStorage.setItem('boarding-entries', JSON.stringify(localEntries));
  } catch (e) {
    // quota exceeded, silently fail
  }
}

function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('boarding-entries');
    if (data) {
      localEntries = JSON.parse(data);
      localIdCounter = localEntries.reduce((max, e) => Math.max(max, parseInt(e.id) || 0), 0) + 1;
    }
  } catch (e) {
    localEntries = [];
  }
}

// Initialize local storage on module load
loadFromLocalStorage();
