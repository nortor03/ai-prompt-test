"use client";

import { useState } from "react";

const aiProviders = {
  ChatGPT: ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"],
  Claude: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"],
  Gemini: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
};

const savedPrompts = [
  { id: "p1", name: "วิเคราะห์ความกว้างของถนนในซอย (Road Width Estimation)" },
  { id: "p2", name: "ตรวจจับสิ่งชำรุดและสภาพแวดล้อมในชุมชน (Defects & Landscape)" },
  { id: "p3", name: "วิเคราะห์และแยกแยะสิ่งกีดขวางบนทางเท้า (Sidewalk Obstacles)" },
];

const routes = [
  {
    id: "road-dimension",
    name: "ตรวจวัดขนาดถนนและช่องทางเดินรถ (Road Dimensions)",
    images: [
      { id: "IMG-001", name: "soi_subdivision_narrow_road.jpg" },
      { id: "IMG-002", name: "main_street_crosswalk.jpg" },
      { id: "IMG-003", name: "asphalt_road_with_sidewalk.png" },
    ],
  },
  {
    id: "community-environment",
    name: "ตรวจจับสภาพแวดล้อมรอบข้างในชุมชน (Community Environment)",
    images: [
      { id: "IMG-001", name: "drainage_grate_clogged.jpg" },
      { id: "IMG-002", name: "residential_frontage_trees.jpg" },
      { id: "IMG-003", name: "alleyway_waste_bin_overflow.jpg" },
      { id: "IMG-004", name: "public_park_greenery_boundary.png" },
      { id: "IMG-005", name: "street_lighting_pole_night.jpg" },
    ],
  },
  {
    id: "footpath-obstacles",
    name: "ตรวจพบสิ่งกีดขวางบนทางเท้าและเสาไฟฟ้า (Footpath Obstacles)",
    images: [
      { id: "IMG-001", name: "entangled_overhead_power_lines.jpg" },
      { id: "IMG-002", name: "hawker_stalls_blocking_sidewalk.png" },
      { id: "IMG-003", name: "abandoned_bicycle_on_walkway.jpg" },
    ],
  },
];

export default function PromptPlaygroundPage() {
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof aiProviders>("ChatGPT");
  const [selectedModel, setSelectedModel] = useState(aiProviders["ChatGPT"][0]);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [testScope, setTestScope] = useState<"all" | "single">("all");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const handleProviderChange = (provider: keyof typeof aiProviders) => {
    setSelectedProvider(provider);
    setSelectedModel(aiProviders[provider][0]);
  };

  const handleRouteChange = (routeId: string) => {
    setSelectedRoute(routeId);
    setSelectedImage("");
  };

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Running Test with:", {
      provider: selectedProvider,
      model: selectedModel,
      promptId: selectedPrompt,
      scope: testScope,
      routeId: selectedRoute,
      imageId: testScope === "single" ? selectedImage : "ALL_IMAGES",
    });
    alert("ส่งคำสั่งทดสอบไปยัง AI เรียบร้อยแล้ว!");
  };

  const currentRouteImages = routes.find((r) => r.id === selectedRoute)?.images ?? [];


  const selectClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all duration-150 cursor-pointer";

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      
      {/* Header ส่วนหัวเว้นระยะกำลังดี */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ทดสอบ AI Prompt (Playground)</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          เลือกโมเดล คำสั่ง Prompt และขอบเขตคลังรูปภาพที่ต้องการส่งไปทดสอบประมวลผล
        </p>
      </div>

      <form onSubmit={handleRunTest} className="flex flex-col gap-7">
        
        {/* ครอบกลุ่ม Input ด้านบนด้วยการแบ่งสัดส่วนกึ่งกลาง */}
        <div className="flex gap-6">
          {/* เลือก AI */}
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">เลือก AI</label>
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value as keyof typeof aiProviders)}
              className={selectClass}
            >
              {Object.keys(aiProviders).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* เลือกโมเดล */}
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">เลือกโมเดล</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={`${selectClass} font-mono text-xs`}
            >
              {aiProviders[selectedProvider].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* เลือก Prompt */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">เลือก Prompt</label>
          <select
            required
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>-- เลือกชื่อ Prompt ที่ต้องการใช้งาน --</option>
            {savedPrompts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* กล่องขอบเขตรูปภาพ: ปรับเป็นกระดาษสีขาวขอบเทาอ่อน ให้ความรู้สึกพรีเมียม ไม่ทึบ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="px-1">
            <h2 className="text-sm font-bold text-slate-900">ขอบเขตข้อมูลรูปภาพใน Route</h2>
            <p className="text-xs text-slate-400 mt-0.5">เลือกการจัดกลุ่มรูปภาพเพื่อส่งเข้าโมเดลประมวลผล</p>
          </div>

          {/* ปุ่ม Radio รูปแบบกล่องสไตล์มินิมอลที่มีช่องไฟรอบตัวหนังสือ ไม่ติดขอบ */}
          <div className="flex gap-4">
            {(["all", "single"] as const).map((scope) => {
              const isSelected = testScope === scope;
              return (
                <label
                  key={scope}
                  className={`flex-1 flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-50/80 border-slate-950 ring-1 ring-slate-950"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="testScope"
                    value={scope}
                    checked={isSelected}
                    onChange={() => { setTestScope(scope); setSelectedRoute(""); setSelectedImage(""); }}
                    className="w-4 h-4 mt-0.5 accent-slate-950 border-slate-300 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {scope === "all" ? "ใช้ทั้ง Route" : "เลือกเจาะจง 1 ภาพ"}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {scope === "all" ? "รูปทั้งหมดใน Route ที่เลือก" : "เลือก Route แล้วระบุรูปภาพเดี่ยว"}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* ส่วนกรอกข้อมูล Dynamic ด้านล่าง: ปรับให้เว้นระยะ Padding ชัดเจน */}
          <div className="flex flex-col gap-4 pt-6 border-t border-slate-100">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">เลือก ROUTE</label>
              <select
                required
                value={selectedRoute}
                onChange={(e) => handleRouteChange(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>-- เลือก Route --</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {testScope === "single" && selectedRoute && (
              <div className="flex flex-col gap-2 animate-fade-in">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">เลือกรูปภาพ</label>
                <select
                  required
                  value={selectedImage}
                  onChange={(e) => setSelectedImage(e.target.value)}
                  className={selectClass}
                >
                  <option value="" disabled>-- เลือกรูปภาพ --</option>
                  {currentRouteImages.map((img) => (
                    <option key={img.id} value={img.id}>{img.id} — {img.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-10 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-base rounded-xl transition-colors duration-150 shadow-md tracking-wide cursor-pointer"
          >
            Run Test
          </button>
        </div>

      </form>
    </div>
  );
}
