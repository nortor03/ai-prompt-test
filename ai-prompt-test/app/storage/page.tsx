"use client";

import { useEffect, useState } from "react";
import {
  getStorageRecords,
  deleteStorageRecord,
  storageImageUrl,
  StorageRecord,
} from "@/app/lib/storage";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function StoragePage() {
  const [records, setRecords] = useState<StorageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getStorageRecords({ limit: 100 })
      .then((r) => setRecords(r.records))
      .catch(() => setError("เชื่อมต่อ storage-service ไม่ได้ (รันที่ localhost:8001 อยู่ไหม?)"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("ลบรายการนี้ออกจากฐานข้อมูล?")) return;
    setDeletingId(id);
    try {
      await deleteStorageRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("ลบไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Storage</h1>
        <p className="text-sm text-slate-500 mt-1">
          รูปภาพและผลวิเคราะห์ที่บันทึกถาวรใน MongoDB (storage-service)
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 px-2">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-sm text-red-500 px-2">{error}</p>
      ) : records.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-12 text-center text-sm text-slate-400">
          ยังไม่มีรายการ — วิเคราะห์รูปแล้วเปิดหน้าผลของ Job เพื่อบันทึกลงฐานข้อมูล
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storageImageUrl(rec.image_filename)}
                alt={rec.original_filename}
                className="w-full sm:w-56 h-48 sm:h-auto object-cover bg-slate-100 shrink-0"
              />
              <div className="p-5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-900 truncate">
                      {rec.original_filename}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {[rec.engine, rec.model].filter(Boolean).join(" / ") || "-"} · {formatTime(rec.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    disabled={deletingId === rec.id}
                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline disabled:opacity-40 shrink-0"
                  >
                    {deletingId === rec.id ? "กำลังลบ..." : "ลบ"}
                  </button>
                </div>
                <pre className="mt-3 text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 overflow-x-auto max-h-56 whitespace-pre-wrap break-words">
                  {JSON.stringify(rec.analysis, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
