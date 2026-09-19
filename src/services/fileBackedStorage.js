const API = '/api/storage';

// Only these keys get written to / read from disk. 'pyccy-state' holds the
// full in-progress board (guesses, checkResult, history) and resets hourly —
// no value in persisting it, and it's what was bloating the file.
const PERSISTED_KEYS = new Set(['pyccy-statistics']);

async function fetchSnapshot() {
  try {
    const res = await fetch(API);
    return res.ok ? await res.json() : {};
  } catch (e) {
    console.error('Failed to load saved data from file', e);
    return {};
  }
}

function persistKey(key, rawValue) {
  fetch(`${API}/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawValue,
  }).catch((e) => console.error('Failed to save to file', e));
}

function deleteKey(key) {
  fetch(`${API}/${encodeURIComponent(key)}`, { method: 'DELETE' }).catch((e) =>
    console.error('Failed to delete from file', e)
  );
}

export async function hydrateLocalStorageFromFile() {
  const snapshot = await fetchSnapshot();
  Object.entries(snapshot).forEach(([key, value]) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  });
}

export const fileBackedLocalStorage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    if (PERSISTED_KEYS.has(key)) {
      persistKey(key, value);
    }
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    if (PERSISTED_KEYS.has(key)) {
      deleteKey(key);
    }
  },
};