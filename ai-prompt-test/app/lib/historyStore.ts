// Local, persistent analysis history (IndexedDB).
//
// Each completed analysis result is saved here — the full record (analysis +
// metadata + the original image) — so the History page works entirely offline:
// it survives page refreshes/browser restarts and does not depend on the
// backend (which prunes jobs after 24h and now requires an API key).
//
// Scope: data lives in THIS browser only (not shared across devices).

const DB_NAME = "ucr-history";
const STORE = "results";

export interface HistoryRecord {
  key: string; // `${jobId}:${index}`
  jobId: string;
  index: number;
  filename: string;
  engine: string | null;
  model: string | null;
  analysis: Record<string, unknown>;
  image?: Blob;
  savedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Ask the browser to keep this data even under storage pressure. */
export async function ensurePersistence(): Promise<void> {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch {
    // best-effort
  }
}

export async function saveRecords(records: HistoryRecord[]): Promise<void> {
  if (records.length === 0) return;
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      records.forEach((r) => store.put(r));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function getAllRecords(): Promise<HistoryRecord[]> {
  const db = await openDB();
  try {
    const records = await new Promise<HistoryRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as HistoryRecord[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    // newest first
    return records.sort((a, b) => b.savedAt - a.savedAt);
  } finally {
    db.close();
  }
}

export async function getRecordImage(key: string): Promise<Blob | null> {
  const db = await openDB();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(((req.result as HistoryRecord | undefined)?.image as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function deleteRecord(key: string): Promise<void> {
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
