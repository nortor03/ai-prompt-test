"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPrompts, deletePrompt, Prompt } from "@/app/lib/api";

function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getPrompts()
      .then((r) => setPrompts(r.prompts))
      .catch((e) => setError(e.message ?? "โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบ prompt "${name}" ?`)) return;
    setDeletingId(id);
    try {
      await deletePrompt(id);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(`ลบไม่สำเร็จ: ${(e as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prompts</h1>
          <p className="text-sm text-slate-500 mt-1">คลัง prompt สำหรับใช้วิเคราะห์รูปภาพ</p>
        </div>
        <Link
          href="/prompts/new"
          className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shrink-0"
        >
          New Prompt
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 px-2">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-sm text-red-500 px-2">{error}</p>
      ) : prompts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-12 text-center text-sm text-slate-400">
          ยังไม่มี prompt — กด New Prompt เพื่อสร้างใหม่
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-start justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <Link href={`/prompts/${p.id}`} className="flex-1 min-w-0 group">
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-slate-950 truncate">
                  {p.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2 whitespace-pre-wrap">
                  {p.text}
                </p>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  แก้ไขล่าสุด {formatTime(p.updated_at)}
                </p>
              </Link>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Link
                  href={`/prompts/${p.id}`}
                  className="text-xs font-medium text-slate-600 hover:text-slate-950 hover:underline"
                >
                  แก้ไข
                </Link>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  disabled={deletingId === p.id}
                  className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline disabled:opacity-40"
                >
                  {deletingId === p.id ? "กำลังลบ..." : "ลบ"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
