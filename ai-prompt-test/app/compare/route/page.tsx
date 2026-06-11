"use client";

import { useEffect, useMemo, useState } from "react";
import { getEngines, submitJob, getJob, EnginesResponse, Job } from "@/app/lib/api";
import DraggableImageList, { ImageItem } from "@/app/components/DraggableImageList";
import ImageUploadBar from "@/app/components/ImageUploadBar";
import CompareResultGrid, { ResultColumn, ImageOption } from "@/app/components/CompareResultGrid";
import PromptSelect from "@/app/components/PromptSelect";
import { saveRecords, ensurePersistence } from "@/app/lib/historyStore";

interface UploadedItem {
  file: File;
  id: string;
  name: string;
}

interface Combo {
  key: string;
  engine: string;
  model: string;
}

interface RunningJob {
  combo: Combo;
  job: Job;
}

export default function CompareRoutePage() {
  const [engines, setEngines] = useState<EnginesResponse | null>(null);
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [runningJobs, setRunningJobs] = useState<RunningJob[]>([]);
  const [stage, setStage] = useState<"setup" | "polling" | "done">("setup");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"byImage" | "byModel">("byImage");
  const [selectedJobIdx, setSelectedJobIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Object URLs for uploaded images (index matches submission order = result.index)
  const imageUrls = useMemo(() => items.map((it) => URL.createObjectURL(it.file)), [items]);
  useEffect(() => () => imageUrls.forEach((u) => URL.revokeObjectURL(u)), [imageUrls]);

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
    }, 3000);
    return () => clearInterval(timer);
  }, [stage, runningJobs]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setItems((prev) => [
      ...prev,
      ...newFiles.map((f, i) => ({
        file: f,
        id: `IMG-${String(prev.length + i + 1).padStart(3, "0")}`,
        name: f.name,
      })),
    ]);
    e.target.value = "";
  };

  const handleImagesChange = (newImages: ImageItem[]) => {
    const byId = Object.fromEntries(items.map((it) => [it.id, it]));
    setItems(newImages.map((img) => byId[img.id]).filter(Boolean));
  };

  const addCombo = () => {
    if (combos.length >= 3 || !engines) return;
    const key = String(Date.now());
    setCombos((prev) => [...prev, { key, engine: engines.default_engine, model: engines.default_model }]);
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
    if (items.length === 0 || combos.length === 0) return;
    setSubmitting(true);
    try {
      const files = items.map((it) => it.file);
      // concurrency=1: process images one at a time so the worker doesn't run
      // out of memory on large image batches (higher values OOM the worker).
      const jobs = await Promise.all(
        combos.map((combo) =>
          submitJob(files, { engine: combo.engine, model: combo.model, concurrency: 1, promptId: selectedPromptId })
        )
      );
      // Save the uploaded images to local storage right away (keyed by job),
      // so the History page can show them regardless of when/where the job finishes.
      ensurePersistence();
      jobs.forEach((job, ji) =>
        saveRecords(
          items.map((it, i) => ({
            key: `${job.id}:${i}`,
            jobId: job.id,
            index: i,
            filename: it.name,
            engine: combos[ji].engine,
            model: combos[ji].model,
            analysis: {},
            image: it.file,
            savedAt: Date.now(),
          }))
        ).catch(() => {})
      );
      setRunningJobs(jobs.map((job, i) => ({ combo: combos[i], job })));
      setStage("polling");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass =
    "px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 cursor-pointer font-mono text-xs";

  const engineNames = Object.keys(engines?.engines ?? {});
  const imageItems: ImageItem[] = items.map((it, i) => ({ id: it.id, name: it.name, url: imageUrls[i] }));

  // Build comparison columns
  const imageOptions: ImageOption[] = runningJobs[0]?.job.results?.map((r) => ({
    index: r.index,
    filename: r.filename,
  })) ?? [];

  // "byModel": one column per engine/model, navigate images one at a time
  const columns: ResultColumn[] = runningJobs.map((rj) => {
    const result = rj.job.results?.[currentImageIndex];
    return {
      engine: rj.combo.engine,
      model: rj.combo.model,
      filename: result?.filename,
      analysis: result?.analysis ?? null,
    };
  });

  // "byImage": one column per image (for a single selected engine/model)
  const selectedRun = runningJobs[selectedJobIdx];
  const imageColumns: ResultColumn[] = (selectedRun?.job.results ?? []).map((r) => ({
    engine: "",
    model: "",
    filename: r.filename,
    imageUrl: imageUrls[r.index],
    analysis: r.analysis,
  }));

  return (
    <div className="max-w-6xl mx-auto px-2">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">เปรียบเทียบด้วย Route</h1>
        <p className="text-sm text-slate-500 mt-1">อัปโหลดรูปภาพ แล้วเปรียบเทียบผลจาก Engine ต่างๆ พร้อมกัน</p>
      </div>

      {stage === "setup" && (
        <div className="space-y-6">
          <ImageUploadBar
            onFileSelect={handleFileSelect}
            title="เพิ่มรูปภาพสำหรับเปรียบเทียบ"
            description="รูปภาพชุดเดียวกันจะถูกส่งไปทุก Engine ที่เลือก"
            multiple
          />

          {items.length > 0 && (
            <DraggableImageList images={imageItems} onChange={handleImagesChange} />
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">เลือก Engine ที่ต้องการเปรียบเทียบ</h2>
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
                <select
                  value={combo.engine}
                  onChange={(e) => updateCombo(combo.key, "engine", e.target.value)}
                  className={selectClass}
                >
                  {engineNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <select
                  value={combo.model}
                  onChange={(e) => updateCombo(combo.key, "model", e.target.value)}
                  className={`${selectClass} flex-1`}
                >
                  {(engines?.engines[combo.engine]?.models ?? []).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {combos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCombo(combo.key)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M3 3.5h9M6 3.5V2.5h3v1M5.5 6v5M9.5 6v5M4 3.5l.5 9h6l.5-9" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Prompt */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">เลือก Prompt</h2>
            <PromptSelect
              value={selectedPromptId}
              onChange={setSelectedPromptId}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || items.length === 0 || combos.length === 0}
              className="px-8 py-3 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shadow-md"
            >
              {submitting ? "กำลังส่ง..." : `เริ่มเปรียบเทียบ (${combos.length} Engine)`}
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

          {stage === "done" && runningJobs.some((rj) => rj.job.results && rj.job.results.length > 0) && (
            <div className="space-y-4">
              {/* View mode toggle */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex p-0.5 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setViewMode("byImage")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      viewMode === "byImage" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    เทียบตามรูป
                  </button>
                  <button
                    onClick={() => setViewMode("byModel")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      viewMode === "byModel" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    เทียบตามโมเดล
                  </button>
                </div>

                {/* In byImage mode, pick which engine/model's results to show */}
                {viewMode === "byImage" && runningJobs.length > 1 && (
                  <select
                    value={selectedJobIdx}
                    onChange={(e) => setSelectedJobIdx(Number(e.target.value))}
                    className={selectClass}
                  >
                    {runningJobs.map((rj, i) => (
                      <option key={i} value={i}>{rj.combo.engine} / {rj.combo.model}</option>
                    ))}
                  </select>
                )}
              </div>

              {viewMode === "byImage" ? (
                <CompareResultGrid columns={imageColumns} minColumnWidth="280px" />
              ) : (
                <CompareResultGrid
                  columns={columns}
                  showImageNav={imageOptions.length > 1}
                  imageOptions={imageOptions}
                  currentImageIndex={currentImageIndex}
                  onImageChange={setCurrentImageIndex}
                />
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => { setStage("setup"); setRunningJobs([]); setItems([]); setCurrentImageIndex(0); setSelectedJobIdx(0); }}
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
