"use client";

import { useEffect, useState } from "react";
import { getEngines, EnginesResponse } from "@/app/lib/api";

export default function EnginesPage() {
  const [engines, setEngines] = useState<EnginesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEngines().then(setEngines).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Engines</h1>
        <p className="text-sm text-slate-500 mt-1">AI Engine และ Model ที่พร้อมใช้งานสำหรับการวิเคราะห์รูปภาพ</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 px-2">กำลังโหลด...</p>
      ) : !engines ? (
        <p className="text-sm text-red-500 px-2">ไม่สามารถเชื่อมต่อ API ได้</p>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Engine</p>
              <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">{engines.default_engine}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Model</p>
              <p className="text-sm font-mono text-slate-700 mt-1">{engines.default_model}</p>
            </div>
          </div>

          {Object.entries(engines.engines).map(([engineName, detail]) => (
            <div key={engineName} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-base font-bold text-slate-900 capitalize">{engineName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{detail.models.length} model ที่รองรับ</p>
              </div>
              <div className="divide-y divide-slate-100">
                {detail.models.map((model) => (
                  <div key={model} className="px-6 py-3 flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-700">{model}</span>
                    {model === engines.default_model && (
                      <span className="text-xs px-2 py-0.5 bg-slate-950 text-white rounded font-medium">default</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl">
            <h3 className="text-sm font-bold text-blue-900 mb-1">Analysis Prompt</h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              ระบบใช้ Urban Microclimate Analysis Prompt ที่กำหนดไว้ตายตัว วิเคราะห์
              urban morphology, vegetation, surface & flood indicators และ health & livability
              จากรูปภาพ Street View ในบริบทเมืองเอเชียตะวันออกเฉียงใต้
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
