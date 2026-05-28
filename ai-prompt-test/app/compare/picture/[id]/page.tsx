"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfigFilterBar from "@/app/components/ConfigFilterBar";
import ConfigCardList, { ConfigItem } from "@/app/components/ConfigCardList";

const availableConfigs: ConfigItem[] = [
  { id: "c1", provider: "ChatGPT", model: "gpt-4o", promptName: "วิเคราะห์ความกว้างของถนนในซอย (Road Width)" },
  { id: "c2", provider: "ChatGPT", model: "gpt-4o-mini", promptName: "วิเคราะห์ความกว้างของถนนในซอย (Road Width)" },
  { id: "c3", provider: "Claude", model: "claude-sonnet-4-6", promptName: "วิเคราะห์ความกว้างของถนนในซอย (Road Width)" },
  { id: "c4", provider: "Gemini", model: "gemini-2.0-flash", promptName: "ตรวจจับสิ่งชำรุดรอบชุมชน (Infrastructure Defects)" },
  { id: "c5", provider: "ChatGPT", model: "o1", promptName: "ตรวจจับสิ่งชำรุดรอบชุมชน (Infrastructure Defects)" },
  { id: "c6", provider: "Claude", model: "claude-opus-4-7", promptName: "วิเคราะห์และแยกแยะสิ่งกีดขวางบนทางเท้า (Sidewalk Obstacles)" },
];

export default function PictureComparisonFilterPage() {
  const params = useParams();
  const router = useRouter();

  const compositeId = params.id as string;
  const [routeId, pictureId] = compositeId ? compositeId.split("_") : ["", ""];

  const [filterProvider, setFilterProvider] = useState("all");
  const [filterModel, setFilterModel] = useState("all");
  const [filterPrompt, setFilterPrompt] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleProviderChange = (v: string) => {
    setFilterProvider(v);
    setFilterModel("all");
    setFilterPrompt("all");
  };

  const handleModelChange = (v: string) => {
    setFilterModel(v);
    setFilterPrompt("all");
  };

  // Derived option lists (cascade)
  const providers = [...new Set(availableConfigs.map((c) => c.provider))];
  const models = [
    ...new Set(
      availableConfigs
        .filter((c) => filterProvider === "all" || c.provider === filterProvider)
        .map((c) => c.model)
    ),
  ];
  const prompts = [
    ...new Set(
      availableConfigs
        .filter((c) => filterProvider === "all" || c.provider === filterProvider)
        .filter((c) => filterModel === "all" || c.model === filterModel)
        .map((c) => c.promptName)
    ),
  ];

  const filteredConfigs = availableConfigs.filter(
    (c) =>
      (filterProvider === "all" || c.provider === filterProvider) &&
      (filterModel === "all" || c.model === filterModel) &&
      (filterPrompt === "all" || c.promptName === filterPrompt)
  );

  const handleToggleConfig = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert("คุณสามารถเลือกเปรียบเทียบได้สูงสุด 3 รูปแบบเท่านั้นครับ");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleFinalCompare = () => {
    if (selectedIds.length === 0) {
      alert("กรุณาเลือกรูปแบบที่ต้องการเปรียบเทียบอย่างน้อย 1 รายการ");
      return;
    }
    router.push(`/compare/picture/${compositeId}/result?configs=${selectedIds.join(",")}`);
  };

  const getPicUrl = (rId: string): string => {
    if (rId === "road-dimension") {
      return "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80";
    }
    if (rId === "community-environment") {
      return "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=80";
    }
    if (rId === "footpath-obstacles") {
      return "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1506521788723-868126d5e368?w=600&auto=format&fit=crop&q=80";
  };

  const getPicName = (rId: string): string => {
    if (rId === "road-dimension") return "soi_subdivision_narrow_road.jpg";
    if (rId === "community-environment") return "drainage_grate_clogged.jpg";
    if (rId === "footpath-obstacles") return "entangled_overhead_power_lines.jpg";
    return "community_default_view.jpg";
  };

  return (
    <div className="max-w-4xl mx-auto px-2">

      {/* ส่วนหัวหน้า */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Target Image: {pictureId} (Route: {routeId})</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">เลือกโมเดลและ Prompt สำหรับรูปภาพนี้</h1>
          <p className="text-sm text-slate-500 mt-1">
            เลือกเงื่อนไขค่าย AI เพื่อส่องดูผลลัพธ์เฉพาะภาพ <span className="font-bold text-slate-950">(เลือกแล้ว {selectedIds.length}/3 รายการ)</span>
          </p>
        </div>
        <button onClick={() => router.push("/compare/picture")} className="text-xs font-medium text-slate-500 hover:text-slate-950 hover:underline shrink-0">
          กลับไปเลือกรูปภาพ
        </button>
      </div>

      {/* กล่องพรีวิวรูปภาพเป้าหมาย ขนาดใหญ่ขึ้น ชัดเจน */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-6 shadow-sm">
        <div className="w-64 h-40 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm">
          <img
            src={getPicUrl(routeId)}
            alt={pictureId}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">รูปภาพเป้าหมาย (Target Image)</span>
          <h2 className="text-lg font-bold text-slate-900">{getPicName(routeId)}</h2>
          <p className="text-xs text-slate-400 font-mono">ID: {pictureId}</p>
          <p className="text-sm text-slate-500 pt-1">
            จาก Route: <span className="font-semibold text-slate-700">{routeId === "road-dimension" ? "ตรวจวัดขนาดถนนและช่องทางเดินรถ" : routeId === "community-environment" ? "ตรวจจับสภาพแวดล้อมรอบข้างในชุมชน" : "ตรวจพบสิ่งกีดขวางบนทางเท้าและเสาไฟฟ้า"}</span>
          </p>
        </div>
      </div>

      <ConfigFilterBar
        providers={providers}
        selectedProvider={filterProvider}
        onProviderChange={handleProviderChange}
        models={models}
        selectedModel={filterModel}
        onModelChange={handleModelChange}
        prompts={prompts}
        selectedPrompt={filterPrompt}
        onPromptChange={setFilterPrompt}
        className="mb-6"
      />

      <ConfigCardList
        configs={filteredConfigs}
        selectedIds={selectedIds}
        onToggle={handleToggleConfig}
      />

      {/* ปุ่มกดสรุป */}
      <div className="flex justify-end pt-8 mt-4 border-t border-slate-100">
        <button
          onClick={handleFinalCompare}
          className="px-8 py-3 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-md"
        >
          เริ่มเปรียบเทียบผลลัพธ์ ({selectedIds.length}/3)
        </button>
      </div>

    </div>
  );
}
