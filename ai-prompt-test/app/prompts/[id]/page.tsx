"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPrompt, updatePrompt, deletePrompt, Prompt } from "@/app/lib/api";
import PromptForm from "@/app/components/PromptForm";

function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function EditPromptPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getPrompt(id)
      .then(setPrompt)
      .catch((e) => setError(e.message ?? "ไม่พบ prompt นี้"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!prompt || !confirm(`ลบ prompt "${prompt.name}" ?`)) return;
    setDeleting(true);
    try {
      await deletePrompt(id);
      router.push("/prompts");
    } catch (e) {
      alert(`ลบไม่สำเร็จ: ${(e as Error).message}`);
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      <div className="mb-8">
        <Link href="/prompts" className="text-xs font-medium text-slate-400 hover:text-slate-700 hover:underline">
          ← กลับไปคลัง Prompt
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">แก้ไข Prompt</h1>
            {prompt && (
              <p className="text-xs text-slate-400 mt-1 font-mono">
                สร้าง {formatTime(prompt.created_at)} · แก้ไขล่าสุด {formatTime(prompt.updated_at)}
              </p>
            )}
          </div>
          {prompt && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm rounded-xl transition-colors shrink-0 disabled:opacity-40"
            >
              {deleting ? "กำลังลบ..." : "ลบ Prompt"}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 px-2">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-sm text-red-500 px-2">{error}</p>
      ) : prompt ? (
        <>
          {saved && (
            <p className="text-sm text-green-600 px-1 mb-4">บันทึกเรียบร้อยแล้ว ✓</p>
          )}
          <PromptForm
            initial={{ name: prompt.name, text: prompt.text }}
            submitLabel="บันทึกการแก้ไข"
            onSubmit={async (values) => {
              const updated = await updatePrompt(id, values);
              setPrompt(updated);
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
          />
        </>
      ) : null}

    </div>
  );
}
