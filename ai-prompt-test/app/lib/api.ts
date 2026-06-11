const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://13.250.6.178:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

// ── Engines ───────────────────────────────────────────────

export interface EngineDetail {
  name: string;
  models: string[];
}

interface RawEnginesResponse {
  default_engine: string;
  default_model: string;
  engines: EngineDetail[];
}

export interface EnginesResponse {
  default_engine: string;
  default_model: string;
  engines: Record<string, EngineDetail>;
}

export const getEngines = (): Promise<EnginesResponse> =>
  request<RawEnginesResponse>("/api/engines").then((raw) => ({
    ...raw,
    engines: Object.fromEntries(raw.engines.map((e) => [e.name, e])),
  }));

// ── Jobs ──────────────────────────────────────────────────

export interface JobProgress {
  current: number;
  total: number;
  percent: number;
  active_files: string[];
  last_completed: string | null;
}

export interface JobResult {
  index: number;
  filename: string;
  analysis: Record<string, unknown>;
}

export interface JobFailed {
  index: number;
  filename: string;
  reason: string;
}

export interface Job {
  id: string;
  status: "pending" | "processing" | "done" | "failed";
  progress: JobProgress;
  submitted_at: number | null;
  engine: string | null;
  model: string | null;
  results: JobResult[] | null;
  failed: JobFailed[] | null;
  error: string | null;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
}

export const getJobs = (params?: { limit?: number; offset?: number; status?: string }) => {
  const q = new URLSearchParams();
  if (params?.limit !== undefined) q.set("limit", String(params.limit));
  if (params?.offset !== undefined) q.set("offset", String(params.offset));
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return request<JobListResponse>(`/api/jobs${qs ? `?${qs}` : ""}`);
};

export const getJob = (id: string) => request<Job>(`/api/jobs/${id}`);

/** URL of the original uploaded image for a job result, by its result index. */
export const jobImageUrl = (jobId: string, index: number) =>
  `${BASE}/api/jobs/${jobId}/images/${index}`;

export const submitJob = (
  files: File[],
  options?: { engine?: string; model?: string; concurrency?: number; promptId?: string }
): Promise<Job> => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  if (options?.engine) form.append("engine", options.engine);
  if (options?.model) form.append("model", options.model);
  if (options?.concurrency !== undefined)
    form.append("concurrency", String(options.concurrency));
  if (options?.promptId) form.append("prompt_id", options.promptId);
  return fetch(`${BASE}/api/jobs/images`, { method: "POST", body: form }).then(
    async (r) => {
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || r.statusText);
      }
      return r.json() as Promise<Job>;
    }
  );
};

export const deleteJob = (id: string) =>
  fetch(`${BASE}/api/jobs/${id}`, { method: "DELETE" });

export const retryJob = (
  id: string,
  options?: { engine?: string; model?: string }
): Promise<Job> => {
  const form = new FormData();
  if (options?.engine) form.append("engine", options.engine);
  if (options?.model) form.append("model", options.model);
  return fetch(`${BASE}/api/jobs/${id}/retry`, { method: "POST", body: form }).then(
    async (r) => {
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || r.statusText);
      }
      return r.json() as Promise<Job>;
    }
  );
};

// ── Prompts ───────────────────────────────────────────────

export interface Prompt {
  id: string;
  name: string;
  text: string;
  created_at: number;
  updated_at: number;
}

export interface PromptListResponse {
  prompts: Prompt[];
  total: number;
}

export const getPrompts = () => request<PromptListResponse>("/api/prompts");

export const getPrompt = (id: string) => request<Prompt>(`/api/prompts/${id}`);

export const createPrompt = (data: { name: string; text: string }) =>
  request<Prompt>("/api/prompts", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updatePrompt = (
  id: string,
  data: { name?: string; text?: string }
) =>
  request<Prompt>(`/api/prompts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletePrompt = (id: string) =>
  fetch(`${BASE}/api/prompts/${id}`, { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text();
      throw new Error(t || r.statusText);
    }
  });

// ── Single image analysis ─────────────────────────────────

export const analyzeImage = (
  file: File,
  options?: { engine?: string; model?: string; promptId?: string }
): Promise<Record<string, unknown>> => {
  const form = new FormData();
  form.append("file", file);
  if (options?.engine) form.append("engine", options.engine);
  if (options?.model) form.append("model", options.model);
  if (options?.promptId) form.append("prompt_id", options.promptId);
  return fetch(`${BASE}/api/analyze`, { method: "POST", body: form }).then(
    async (r) => {
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || r.statusText);
      }
      return r.json();
    }
  );
};
