"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJob, retryJob, deleteJob, Job } from "@/app/lib/api";
import { logAnalysis } from "@/app/lib/mlflow";
import { getRecordImage } from "@/app/lib/historyStore";
import { getStorageRecords, saveAnalysisRecord } from "@/app/lib/storage";

function StatusBadge({ status }: { status: Job["status"] }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    done: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    pending: "รอดำเนินการ",
    processing: "กำลังประมวลผล",
    done: "เสร็จสิ้น",
    failed: "ล้มเหลว",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function AnalysisCard({ result, imageUrl }: { result: { index: number; filename: string; analysis: Record<string, unknown> }; imageUrl?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-xs font-mono font-semibold text-slate-500">#{result.index + 1}</span>
        <span className="ml-2 text-sm font-medium text-slate-900">{result.filename}</span>
      </div>
      {imageUrl && (
        <div className="px-5 pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={result.filename}
            className="w-full h-auto max-h-96 object-contain rounded-lg border border-slate-200 bg-slate-50"
          />
        </div>
      )}
      <div className="p-5 space-y-4">
        {Object.entries(result.analysis).map(([key, value]) => {
          if (value === null || value === undefined) return null;

          if (typeof value === "object" && !Array.isArray(value)) {
            return (
              <div key={key}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {key.replace(/_/g, " ")}
                </p>
                <div className="space-y-1 pl-2 border-l-2 border-slate-100">
                  {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="text-slate-400 font-mono shrink-0 min-w-[140px]">{k}</span>
                      <span className="text-slate-700 font-medium">{renderValue(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (Array.isArray(value)) {
            return (
              <div key={key}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {key.replace(/_/g, " ")}
                </p>
                <div className="space-y-0.5 pl-2">
                  {(value as unknown[]).map((item, i) => (
                    <p key={i} className="text-xs text-slate-700">{renderValue(item)}</p>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="flex gap-2 text-xs">
              <span className="text-slate-400 font-mono shrink-0 min-w-[140px]">{key.replace(/_/g, " ")}</span>
              <span className="text-slate-700 font-medium">{renderValue(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const loggedRef = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    getJob(jobId).then(setJob).finally(() => setLoading(false));
  }, [jobId]);

  // Load locally-cached images for this job's results.
  useEffect(() => {
    if (job?.status !== "done" || !job.results) return;
    let cancelled = false;
    const created: string[] = [];
    (async () => {
      const map: Record<number, string> = {};
      for (const r of job.results!) {
        const blob = await getRecordImage(`${jobId}:${r.index}`);
        if (blob) {
          const u = URL.createObjectURL(blob);
          map[r.index] = u;
          created.push(u);
        }
      }
      if (!cancelled) setImageUrls(map);
      else created.forEach((u) => URL.revokeObjectURL(u));
    })();
    return () => {
      cancelled = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [job?.status, jobId, job?.results]);

  useEffect(() => {
    if (!job || job.status === "done" || job.status === "failed") return;
    const timer = setInterval(() => {
      getJob(jobId).then(setJob);
    }, 3000);
    return () => clearInterval(timer);
  }, [job?.status, jobId]);

  useEffect(() => {
    if (job?.status === "done" && job.results && !loggedRef.current) {
      loggedRef.current = true;
      job.results.forEach((r) => {
        logAnalysis({
          runName: `${jobId} / ${r.filename}`,
          engine: job.engine ?? "",
          model: job.model ?? "",
          filename: r.filename,
          analysis: r.analysis,
        });
      });
    }
  }, [job?.status]);

  // On completion, persist each image + its analysis to the storage service.
  // Idempotent: skips if this job's records already exist there.
  useEffect(() => {
    if (job?.status !== "done" || !job.results || savedRef.current) return;
    savedRef.current = true;
    const results = job.results;
    (async () => {
      try {
        const existing = await getStorageRecords({ source: jobId, limit: 1 });
        if (existing.total > 0) return;
        for (const r of results) {
          const blob = await getRecordImage(`${jobId}:${r.index}`);
          if (!blob) continue; // no local image bytes — nothing to upload
          await saveAnalysisRecord({
            blob,
            filename: r.filename,
            analysis: r.analysis,
            engine: job.engine,
            model: job.model,
            source: jobId,
          });
        }
      } catch {
        savedRef.current = false; // allow a later retry if the service was down
      }
    })();
  }, [job?.status, jobId, job?.results, job?.engine, job?.model]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const updated = await retryJob(jobId);
      setJob(updated);
    } catch (err) {
      alert("Retry ไม่สำเร็จ: " + err);
    } finally {
      setRetrying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("ต้องการลบ Job นี้หรือไม่?")) return;
    setDeleting(true);
    await deleteJob(jobId);
    router.push("/jobs");
  };

  if (loading) return <p className="text-sm text-slate-400 px-4 mt-8">กำลังโหลด...</p>;
  if (!job) return <p className="text-sm text-red-500 px-4 mt-8">ไม่พบ Job นี้</p>;

  const isActive = job.status === "pending" || job.status === "processing";

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Job: {job.id}</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">ผลลัพธ์การวิเคราะห์</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={job.status} />
            <span className="text-xs font-mono text-slate-500 capitalize">{job.engine} / {job.model}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {job.status === "failed" && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-3 py-2 text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              {retrying ? "กำลัง Retry..." : "Retry"}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting || isActive}
            className="px-3 py-2 text-xs font-medium bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            ลบ
          </button>
          <button
            onClick={() => router.push("/jobs")}
            className="text-xs font-medium text-slate-500 hover:text-slate-950 hover:underline px-2"
          >
            กลับ
          </button>
        </div>
      </div>

      {/* Progress */}
      {isActive && (
        <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-blue-900">กำลังประมวลผล...</p>
            <span className="text-sm font-mono text-blue-700">{job.progress.current}/{job.progress.total} รูป ({job.progress.percent}%)</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${job.progress.percent}%` }}
            />
          </div>
          {job.progress.last_completed && (
            <p className="text-xs text-blue-600 mt-2 font-mono">ล่าสุด: {job.progress.last_completed}</p>
          )}
        </div>
      )}

      {job.status === "failed" && job.error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <strong>Error:</strong> {job.error}
        </div>
      )}

      {job.status === "done" && job.results && job.results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">ผลลัพธ์</h2>
            <span className="text-xs text-slate-400 font-mono">
              {job.results.length} สำเร็จ{job.failed && job.failed.length > 0 ? ` · ${job.failed.length} ล้มเหลว` : ""}
            </span>
          </div>
          {job.results.map((r) => (
            <AnalysisCard key={r.index} result={r} imageUrl={imageUrls[r.index]} />
          ))}
          {job.failed && job.failed.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-bold text-red-700 uppercase mb-2">ล้มเหลว ({job.failed.length} รูป)</p>
              {job.failed.map((f) => (
                <p key={f.index} className="text-xs text-red-600 font-mono">{f.filename}: {f.reason}</p>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
