"use client";

import Link from "next/link";
import { useState } from "react";
import PromptTooltip from "@/app/components/PromptTooltip";
import { promptFullTextByName } from "@/app/data/prompts";

interface PromptItem {
  id: string;
  name: string;
  description: string;
}

export default function PromptSettingsPage() {
  const [prompts] = useState<PromptItem[]>([
    { id: "p1", name: "วิเคราะห์ความกว้างของถนนในซอย (Road Width)", description: "วัดและประเมินความกว้างของถนนในซอยจากภาพถ่าย" },
    { id: "p2", name: "ตรวจจับสิ่งชำรุดรอบชุมชน (Infrastructure Defects)", description: "ตรวจจับและระบุสิ่งชำรุดเสียหายในพื้นที่ชุมชน" },
    { id: "p3", name: "วิเคราะห์และแยกแยะสิ่งกีดขวางบนทางเท้า (Sidewalk Obstacles)", description: "ตรวจจับสิ่งกีดขวางบนทางเท้าและบริเวณเสาไฟฟ้า" },
  ]);

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">จัดการ Prompt (Prompt Settings)</h1>
          <p className="text-sm text-slate-500 mt-1">ดูและจัดการคำสั่ง Prompt ที่ใช้ทดสอบกับ AI</p>
        </div>
        <Link
          href="/prompts/create"
          className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shrink-0"
        >
          Create New Prompt
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">ชื่อ Prompt</th>
                <th className="px-6 py-4">รายละเอียด</th>
                <th className="px-6 py-4 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {prompts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-400">
                    ยังไม่มี Prompt ในระบบ — กด Create New Prompt เพื่อเริ่มต้น
                  </td>
                </tr>
              )}
              {prompts.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <PromptTooltip
                      name={prompt.name}
                      fullText={promptFullTextByName[prompt.name] ?? prompt.name}
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-500">{prompt.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => console.log("delete", prompt.id)}
                      className="hover:opacity-70 transition-opacity pr-2"
                      style={{ color: "#ef4444" }}
                      aria-label="ลบ Prompt"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M3 3.5h9M6 3.5V2.5h3v1M5.5 6v5M9.5 6v5M4 3.5l.5 9h6l.5-9" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
