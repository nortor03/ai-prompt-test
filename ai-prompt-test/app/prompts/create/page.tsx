"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePromptPage() {
  const router = useRouter();

  const [promptName, setPromptName] = useState("");
  const [description, setDescription] = useState("");
  const [promptText, setPromptText] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving Prompt:", { promptName, description, promptText });
    alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    router.push("/prompts");
  };

  return (
    <div className="max-w-3xl mx-auto">

      <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">สร้าง Prompt ใหม่</h1>
          <p className="text-sm text-slate-500 mt-1">กำหนดรายละเอียดและข้อความคำสั่งสำหรับนำไปทดสอบกับ AI</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/prompts")}
          className="text-xs font-medium text-slate-500 hover:text-slate-950 hover:underline"
        >
          ยกเลิก
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">ชื่อของ Prompt</label>
          <input
            type="text"
            required
            placeholder="เช่น ตรวจจับสิ่งของในภาพ"
            value={promptName}
            onChange={(e) => setPromptName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">รายละเอียดของ Prompt</label>
          <input
            type="text"
            placeholder="อธิบายว่าใช้ทดสอบอะไร"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Prompt</label>
          <textarea
            required
            rows={8}
            placeholder="พิมพ์คำสั่งหรือ Prompt ที่นี่"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all resize-y font-mono"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors duration-150 shadow-sm"
          >
            Save Prompt
          </button>
        </div>

      </form>
    </div>
  );
}
