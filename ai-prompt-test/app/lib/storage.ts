// Client for the standalone storage-service (FastAPI + MongoDB).
// Persists analysed images + their results so they survive beyond the
// UCR backend's 24h job TTL and can be browsed on the Storage page.

const STORAGE_BASE =
  process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8001";

export interface StorageRecord {
  id: string;
  original_filename: string;
  image_filename: string;
  image_url: string; // relative to STORAGE_BASE, e.g. /api/images/<file>
  engine: string | null;
  model: string | null;
  prompt_id: string | null;
  source: string | null;
  analysis: Record<string, unknown>;
  created_at: string;
}

export interface StorageListResponse {
  records: StorageRecord[];
  total: number;
}

/** Absolute URL the browser can load an image from. */
export const storageImageUrl = (imageFilename: string) =>
  `${STORAGE_BASE}/api/images/${imageFilename}`;

export const getStorageRecords = (params?: {
  limit?: number;
  offset?: number;
  source?: string;
}): Promise<StorageListResponse> => {
  const q = new URLSearchParams();
  if (params?.limit !== undefined) q.set("limit", String(params.limit));
  if (params?.offset !== undefined) q.set("offset", String(params.offset));
  if (params?.source) q.set("source", params.source);
  const qs = q.toString();
  return fetch(`${STORAGE_BASE}/api/records${qs ? `?${qs}` : ""}`).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });
};

export const saveAnalysisRecord = (opts: {
  blob: Blob;
  filename: string;
  analysis: Record<string, unknown>;
  engine?: string | null;
  model?: string | null;
  promptId?: string | null;
  source?: string;
}): Promise<StorageRecord> => {
  const form = new FormData();
  form.append("file", opts.blob, opts.filename);
  form.append("analysis", JSON.stringify(opts.analysis ?? {}));
  if (opts.engine) form.append("engine", opts.engine);
  if (opts.model) form.append("model", opts.model);
  if (opts.promptId) form.append("prompt_id", opts.promptId);
  if (opts.source) form.append("source", opts.source);
  return fetch(`${STORAGE_BASE}/api/records`, {
    method: "POST",
    body: form,
  }).then(async (r) => {
    if (!r.ok) throw new Error((await r.text()) || r.statusText);
    return r.json();
  });
};

export const deleteStorageRecord = (id: string): Promise<void> =>
  fetch(`${STORAGE_BASE}/api/records/${id}`, { method: "DELETE" }).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
  });
