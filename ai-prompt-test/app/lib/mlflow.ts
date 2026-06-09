const MLFLOW_URL = process.env.NEXT_PUBLIC_MLFLOW_URL ?? "http://localhost:5001";
const EXPERIMENT_NAME = "UCR Urban Analysis";

async function post(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${MLFLOW_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`MLflow ${path}: ${await res.text()}`);
  return res.json();
}

async function getOrCreateExperiment(): Promise<string> {
  const res = await fetch(
    `${MLFLOW_URL}/api/2.0/mlflow/experiments/get-by-name?experiment_name=${encodeURIComponent(EXPERIMENT_NAME)}`
  );
  if (res.ok) {
    const data = (await res.json()) as { experiment: { experiment_id: string } };
    return data.experiment.experiment_id;
  }
  const data = (await post("/api/2.0/mlflow/experiments/create", { name: EXPERIMENT_NAME })) as {
    experiment_id: string;
  };
  return data.experiment_id;
}

async function uploadArtifact(
  experimentId: string,
  runId: string,
  filename: string,
  blob: Blob
): Promise<void> {
  const path = `${experimentId}/${runId}/artifacts/${encodeURIComponent(filename)}`;
  const res = await fetch(`${MLFLOW_URL}/api/2.0/mlflow-artifacts/artifacts/${path}`, {
    method: "PUT",
    body: blob,
  });
  if (!res.ok) throw new Error(`MLflow artifact upload: ${await res.text()}`);
}

export async function logAnalysis(opts: {
  runName: string;
  engine: string;
  model: string;
  filename: string;
  analysis: Record<string, unknown>;
  image?: Blob;
}): Promise<void> {
  try {
    const experimentId = await getOrCreateExperiment();

    const ts = Date.now();
    const runData = (await post("/api/2.0/mlflow/runs/create", {
      experiment_id: experimentId,
      run_name: opts.runName,
      start_time: ts,
    })) as { run: { info: { run_id: string } } };
    const runId = runData.run.info.run_id;

    const metrics: { key: string; value: number; timestamp: number; step: number }[] = [];

    const extractedParams: { key: string; value: string }[] = [];

    function extractValues(obj: Record<string, unknown>, prefix = "") {
      for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === "number" && isFinite(v)) {
          metrics.push({ key, value: v, timestamp: ts, step: 0 });
        } else if (typeof v === "string") {
          // เก็บเฉพาะค่าหมวดหมู่ ข้าม free-text ยาวๆ (notes/evidence)
          if (/notes/i.test(k) || v.length === 0 || v.length > 250) continue;
          extractedParams.push({ key, value: v });
        } else if (typeof v === "boolean") {
          extractedParams.push({ key, value: String(v) });
        } else if (v && typeof v === "object" && !Array.isArray(v)) {
          extractValues(v as Record<string, unknown>, key);
        }
      }
    }
    extractValues(opts.analysis);

    await post("/api/2.0/mlflow/runs/log-batch", {
      run_id: runId,
      params: [
        { key: "engine", value: opts.engine },
        { key: "model", value: opts.model },
        { key: "filename", value: opts.filename },
        ...extractedParams,
      ],
      metrics,
      tags: [{ key: "analysis_json", value: JSON.stringify(opts.analysis) }],
    });

    if (opts.image) {
      await uploadArtifact(experimentId, runId, opts.filename, opts.image);
    }

    await post("/api/2.0/mlflow/runs/update", {
      run_id: runId,
      status: "FINISHED",
      end_time: ts,
    });
  } catch (err) {
    console.warn("[MLflow] logging failed:", err);
  }
}
