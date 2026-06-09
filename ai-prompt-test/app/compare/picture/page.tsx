"use client";

import { useEffect, useRef, useState } from "react";
import { getEngines, submitJob, getJob, EnginesResponse, Job } from "@/app/lib/api";
import CompareResultGrid, { ResultColumn, ImageOption } from "@/app/components/CompareResultGrid";
import { logAnalysis } from "@/app/lib/mlflow";
import { saveRecords, ensurePersistence } from "@/app/lib/historyStore";

interface Combo {
  key: string;
  engine: string;
  model: string;
}

interface RunningJob {
  combo: Combo;
  job: Job;
}

export default function ComparePicturePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [engines, setEngines] = useState<EnginesResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [runningJobs, setRunningJobs] = useState<RunningJob[]>([]);
  const [stage, setStage] = useState<"setup" | "polling" | "done">("setup");
  const [submitting, setSubmitting] = useState(false);
  const loggedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    getEngines().then((e) => {
      setEngines(e);
      setCombos([{ key: "0", engine: e.default_engine, model: e.default_model }]);
    });
  }, []);

  // Poll all running jobs
  useEffect(() => {
    if (stage !== "polling") return;
    const allDone = runningJobs.every((rj) => rj.job.status === "done" || rj.job.status === "failed");
    if (allDone) { setStage("done"); return; }
    const timer = setInterval(async () => {
      const updated = await Promise.all(
        runningJobs.map(async (rj) => ({
          ...rj,
          job: rj.job.status === "done" || rj.job.status === "failed" ? rj.job : await getJob(rj.job.id),
        }))
      );
      setRunningJobs(updated);
      if (updated.every((rj) => rj.job.status === "done" || rj.job.status === "failed")) {
        setStage("done");
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [stage, runningJobs]);

  // Auto-log to MLflow when jobs complete
  useEffect(() => {
    runningJobs.forEach((rj) => {
      if (rj.job.status === "done" && rj.job.results && !loggedRef.current.has(rj.job.id)) {
        loggedRef.current.add(rj.job.id);
        rj.job.results.forEach((r) => {
          logAnalysis({
            runName: `${r.filename} [${rj.combo.engine}]`,
            engine: rj.combo.engine,
            model: rj.combo.model,
            filename: r.filename,
            analysis: r.analysis,
            image: selectedFile ?? undefined,
          });
        });
      }
    });
  }, [runningJobs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setStage("setup");
    setRunningJobs([]);
    loggedRef.current = new Set();
    setPreviewUrl(URL.createObjectURL(file));
  };

  const addCombo = () => {
    if (combos.length >= 3 || !engines) return;
    setCombos((prev) => [
      ...prev,
      { key: String(Date.now()), engine: engines.default_engine, model: engines.default_model },
    ]);
  };

  const removeCombo = (key: string) => {
    setCombos((prev) => prev.filter((c) => c.key !== key));
  };

  const updateCombo = (key: string, field: "engine" | "model", value: string) => {
    setCombos((prev) =>
      prev.map((c) => {
        if (c.key !== key) return c;
        if (field === "engine") {
          const models = engines?.engines[value]?.models ?? [];
          return { ...c, engine: value, model: models[0] ?? "" };
        }
        return { ...c, [field]: value };
      })
    );
  };

  const handleSubmit = async () => {
    if (!selectedFile || combos.length === 0) return;
    setSubmitting(true);
    loggedRef.current = new Set();
    try {
      const jobs = await Promise.all(
        combos.map((combo) => submitJob([selectedFile], { engine: combo.engine, model: combo.model }))
      );
      // Save the uploaded image to local storage right away so History can show it.
      ensurePersistence();
      jobs.forEach((job, ji) =>
        saveRecords([{
          key: `${job.id}:0`,
          jobId: job.id,
          index: 0,
          filename: selectedFile.name,
          engine: combos[ji].engine,
          model: combos[ji].model,
          analysis: {},
          image: selectedFile,
          savedAt: Date.now(),
        }]).catch(() => {})
      );
      setRunningJobs(jobs.map((job, i) => ({ combo: combos[i], job })));
      setStage("polling");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const engineNames = Object.keys(engines?.engines ?? {});
  const selectClass =
    "px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 cursor-pointer font-mono text-xs";

  const imageOptions: ImageOption[] = runningJobs[0]?.job.results?.map((r) => ({
    index: r.index,
    filename: r.filename,
  })) ?? [];

  const columns: ResultColumn[] = runningJobs.map((rj) => {
    const result = rj.job.results?.[0];
    return {
      engine: rj.combo.engine,
      model: rj.combo.model,
      filename: result?.filename,
      analysis: result?.analysis ?? null,
      error: rj.job.status === "failed" ? (rj.job.error ?? "failed") : undefined,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-2">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compare by Image</h1>
        <p className="text-sm text-slate-500 mt-1">อัปโหลดรูปภาพ 1 ใบ เปรียบเทียบผลจาก Engine ต่างๆ — ผลลัพธ์ถูกบันทึกใน Jobs อัตโนมัติ</p>
      </div>

      {stage === "setup" && (
        <div className="space-y-6">
          {/* Image upload */}
          <div
            className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-slate-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="max-h-40 rounded-xl object-contain" />
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-400">คลิกเพื่อเลือกรูปภาพ</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          {selectedFile && (
            <p className="text-xs text-slate-500 font-mono -mt-4 px-1">{selectedFile.name}</p>
          )}

          {/* Engine combos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">เลือก Engine</h2>
              {combos.length < 3 && (
                <button
                  type="button"
                  onClick={addCombo}
                  className="text-xs font-medium text-slate-600 hover:text-slate-950 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                >
                  + เพิ่ม Engine
                </button>
              )}
            </div>
            {combos.map((combo, i) => (
              <div key={combo.key} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs font-mono font-bold text-slate-400 w-5">#{i + 1}</span>
                <select value={combo.engine} onChange={(e) => updateCombo(combo.key, "engine", e.target.value)} className={selectClass}>
                  {engineNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={combo.model} onChange={(e) => updateCombo(combo.key, "model", e.target.value)} className={`${selectClass} flex-1`}>
                  {(engines?.engines[combo.engine]?.models ?? []).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {combos.length > 1 && (
                  <button type="button" onClick={() => removeCombo(combo.key)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M3 3.5h9M6 3.5V2.5h3v1M5.5 6v5M9.5 6v5M4 3.5l.5 9h6l.5-9" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedFile || combos.length === 0}
              className="px-8 py-3 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shadow-md"
            >
              {submitting ? "กำลังส่ง..." : `วิเคราะห์และเปรียบเทียบ (${combos.length} Engine)`}
            </button>
          </div>
        </div>
      )}

      {(stage === "polling" || stage === "done") && (
        <div className="space-y-6">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${runningJobs.length}, 1fr)` }}>
            {runningJobs.map((rj, i) => {
              const statusColor = {
                pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
                processing: "text-blue-700 bg-blue-50 border-blue-200",
                done: "text-green-700 bg-green-50 border-green-200",
                failed: "text-red-700 bg-red-50 border-red-200",
              }[rj.job.status];
              return (
                <div key={i} className={`p-3 rounded-xl border text-xs font-medium ${statusColor}`}>
                  <p className="font-mono">{rj.combo.engine} / {rj.combo.model}</p>
                  <p className="mt-0.5">
                    {rj.job.status === "processing"
                      ? `${rj.job.progress.current}/${rj.job.progress.total} (${rj.job.progress.percent}%)`
                      : rj.job.status}
                  </p>
                </div>
              );
            })}
          </div>

          {stage === "polling" && (
            <p className="text-sm text-slate-400 text-center animate-pulse">กำลังรอผลลัพธ์...</p>
          )}

          {stage === "done" && columns.some((c) => c.analysis) && (
            <CompareResultGrid columns={columns} showImageNav={false} imageOptions={imageOptions} />
          )}

          <div className="flex justify-end">
            <button
              onClick={() => { setStage("setup"); setRunningJobs([]); setSelectedFile(null); setPreviewUrl(null); loggedRef.current = new Set(); }}
              className="text-xs font-medium text-slate-500 hover:text-slate-950 hover:underline"
            >
              เริ่มใหม่
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
