"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DraggableImageList, { ImageItem } from "@/app/components/DraggableImageList";
import ImageUploadBar from "@/app/components/ImageUploadBar";
import { getEngines, submitJob, EnginesResponse } from "@/app/lib/api";
import { saveRecords, ensurePersistence } from "@/app/lib/historyStore";
import PromptSelect from "@/app/components/PromptSelect";

interface UploadedItem {
  file: File;
  id: string;
  name: string;
}

export default function NewJobPage() {
  const router = useRouter();
  const [engines, setEngines] = useState<EnginesResponse | null>(null);
  const [selectedEngine, setSelectedEngine] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getEngines().then((e) => {
      setEngines(e);
      setSelectedEngine(e.default_engine);
      setSelectedModel(e.default_model);
    });
  }, []);

  const handleEngineChange = (engine: string) => {
    setSelectedEngine(engine);
    const models = engines?.engines[engine]?.models ?? [];
    setSelectedModel(models[0] ?? "");
  };

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

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (items.length === 0) {
      alert("กรุณาเพิ่มรูปภาพก่อน");
      return;
    }
    setSubmitting(true);
    try {
      const job = await submitJob(
        items.map((it) => it.file),
        { engine: selectedEngine, model: selectedModel, promptId: selectedPromptId }
      );
      // Save uploaded images locally so the job detail + History can show them.
      ensurePersistence();
      await saveRecords(
        items.map((it, i) => ({
          key: `${job.id}:${i}`,
          jobId: job.id,
          index: i,
          filename: it.name,
          engine: selectedEngine,
          model: selectedModel,
          analysis: {},
          image: it.file,
          savedAt: Date.now(),
        }))
      ).catch(() => {});
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err);
      setSubmitting(false);
    }
  };

  const availableModels = engines?.engines[selectedEngine]?.models ?? [];
  const engineNames = Object.keys(engines?.engines ?? {});
  const selectClass =
    "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all duration-150 cursor-pointer";
  const imageUrls = useMemo(() => items.map((it) => URL.createObjectURL(it.file)), [items]);
  useEffect(() => () => imageUrls.forEach((u) => URL.revokeObjectURL(u)), [imageUrls]);
  const imageItems: ImageItem[] = items.map((it, i) => ({ id: it.id, name: it.name, url: imageUrls[i] }));

  return (
    <div className="max-w-4xl mx-auto px-2">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">สร้าง Analysis Job ใหม่</h1>
        <p className="text-sm text-slate-500 mt-1">อัปโหลดรูปภาพและเลือก AI Engine เพื่อเริ่มวิเคราะห์</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="flex gap-6">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Engine</label>
            <select
              value={selectedEngine}
              onChange={(e) => handleEngineChange(e.target.value)}
              className={selectClass}
            >
              {engineNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={`${selectClass} font-mono text-xs`}
            >
              {availableModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Prompt</label>
          <PromptSelect value={selectedPromptId} onChange={setSelectedPromptId} className={selectClass} />
        </div>

        <ImageUploadBar
          onFileSelect={handleFileSelect}
          title="เพิ่มรูปภาพเข้าสู่ Job"
          description="รองรับหลายไฟล์ในคราวเดียว"
          multiple
        />

        {items.length > 0 && (
          <DraggableImageList images={imageItems} onChange={handleImagesChange} />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            {submitting ? "กำลังส่ง..." : `Submit Job (${items.length} รูป)`}
          </button>
        </div>

      </form>
    </div>
  );
}
