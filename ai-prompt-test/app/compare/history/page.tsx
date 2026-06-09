"use client";

import { useEffect, useMemo, useState } from "react";
import { getJobs, Job } from "@/app/lib/api";
import { getAllRecords, ensurePersistence } from "@/app/lib/historyStore";
import CompareResultGrid, { ResultColumn } from "@/app/components/CompareResultGrid";

interface ImageEntry {
  key: string; // `${jobId}:${index}`
  jobId: string;
  index: number;
  filename: string;
  engine: string | null;
  model: string | null;
  analysis: Record<string, unknown>;
}

function entriesFromJobs(jobs: Job[]): ImageEntry[] {
  const out: ImageEntry[] = [];
  for (const job of jobs) {
    if (job.status !== "done" || !job.results) continue;
    for (const r of job.results) {
      out.push({
        key: `${job.id}:${r.index}`,
        jobId: job.id,
        index: r.index,
        filename: r.filename,
        engine: job.engine,
        model: job.model,
        analysis: r.analysis,
      });
    }
  }
  return out;
}

function Thumb({ url, filename }: { url?: string; filename: string }) {
  if (!url) {
    return (
      <div className="w-full h-40 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 font-mono px-2 text-center">
        <span className="truncate max-w-full">{filename}</span>
        <span className="text-[9px] text-slate-300">(ไม่มีรูปในเครื่องนี้)</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={filename}
      className="w-full h-40 object-contain rounded-lg border border-slate-200 bg-slate-50"
    />
  );
}

export default function CompareHistoryPage() {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [imageBlobs, setImageBlobs] = useState<Record<string, Blob>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    ensurePersistence();
    // List + analysis come from the backend; images come from local storage.
    Promise.all([
      getJobs({ status: "done", limit: 200 }).then((res) => entriesFromJobs(res.jobs)),
      getAllRecords().then((recs) => Object.fromEntries(recs.filter((r) => r.image).map((r) => [r.key, r.image as Blob]))),
    ])
      .then(([es, blobs]) => {
        setEntries(es);
        setImageBlobs(blobs);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Object URLs for images we have locally.
  const urls = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [key, blob] of Object.entries(imageBlobs)) m[key] = URL.createObjectURL(blob);
    return m;
  }, [imageBlobs]);
  useEffect(() => () => Object.values(urls).forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const toggle = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const byKey = useMemo(() => Object.fromEntries(entries.map((e) => [e.key, e])), [entries]);

  const columns: ResultColumn[] = selected
    .map((k) => byKey[k])
    .filter(Boolean)
    .map((e) => ({
      engine: e.engine ?? "",
      model: e.model ?? "",
      filename: e.filename,
      imageUrl: urls[e.key],
      analysis: e.analysis,
    }));

  return (
    <div className="max-w-6xl mx-auto px-2">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">เทียบจากประวัติ</h1>
          <p className="text-sm text-slate-500 mt-1">เลือกรูปที่เคยวิเคราะห์ไปแล้วจากหลาย Job มาเทียบกัน</p>
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="text-xs font-medium text-slate-500 hover:text-slate-950 hover:underline shrink-0"
          >
            ล้างที่เลือก ({selected.length})
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-sm text-red-500">โหลดประวัติไม่สำเร็จ: {error}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400">ยังไม่มีรูปที่วิเคราะห์เสร็จในประวัติ</p>
      ) : (
        <>
          {/* Comparison view */}
          {columns.length > 0 && (
            <div className="mb-8 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">เปรียบเทียบ ({columns.length} รูป)</h2>
              <CompareResultGrid columns={columns} minColumnWidth="280px" />
            </div>
          )}

          {/* Picker gallery */}
          <h2 className="text-sm font-bold text-slate-900 mb-3">เลือกรูป ({entries.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {entries.map((e) => {
              const isSelected = selected.includes(e.key);
              return (
                <button
                  key={e.key}
                  onClick={() => toggle(e.key)}
                  className={`text-left p-2 rounded-xl border transition-all ${
                    isSelected
                      ? "border-slate-950 ring-2 ring-slate-950 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="relative">
                    <Thumb url={urls[e.key]} filename={e.filename} />
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-slate-950 text-white text-xs flex items-center justify-center shadow">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate mt-2">{e.filename}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{e.engine} / {e.model}</p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
