const API = '/api/storage';

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

// Pulls the saved snapshot from disk into localStorage before the app
// mounts, so every synchronous localStorage.getItem() in App.js and
// useAppContext.js sees the persisted data on first render.
export async function hydrateLocalStorageFromFile() {
  const snapshot = await fetchSnapshot();
  Object.entries(snapshot).forEach(([key, value]) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  });
}

// Wraps window.localStorage so every write/removal is mirrored to disk.
// Same getItem/setItem/removeItem shape the app already expects.
export const fileBackedLocalStorage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    persistKey(key, value); // value is already a json string
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    deleteKey(key);
  },
};