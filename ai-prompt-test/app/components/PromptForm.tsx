"use client";

import { useState } from "react";

export interface PromptFormValues {
  name: string;
  text: string;
}

export default function PromptForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: PromptFormValues;
  submitLabel: string;
  onSubmit: (values: PromptFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [text, setText] = useState(initial?.text ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedText = text.trim();
  const canSubmit = trimmedName.length > 0 && trimmedText.length > 0 && !saving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, text: trimmedText });
    } catch (err) {
      setError((err as Error).message ?? "บันทึกไม่สำเร็จ");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            ชื่อ Prompt
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            placeholder="เช่น วิเคราะห์ความกว้างของถนน"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition"
          />
          <p className="text-xs text-slate-400 mt-1.5">{name.length}/200</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            เนื้อหา Prompt
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={16}
            placeholder="พิมพ์คำสั่งสำหรับวิเคราะห์รูปภาพ..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition resize-y"
          />
          <p className="text-xs text-slate-400 mt-1.5">{text.length} ตัวอักษร</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 px-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
