"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJobs, Job } from "@/app/lib/api";

function StatusBadge({ status }: { status: Job["status"] }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    done: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    pending: "รอดำเนินการ",
    processing: "กำลังประมวลผล",
    done: "เสร็จสิ้น",
    failed: "ล้มเหลว",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatTime(ts: number | null) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs({ limit: 50 })
      .then((r) => setJobs(r.jobs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">รายการงานวิเคราะห์รูปภาพทั้งหมด</p>
        </div>
        <Link
          href="/jobs/upload"
          className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shrink-0"
        >
          New Job
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Job ID</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">Engine / Model</th>
                <th className="px-6 py-4 text-center">รูปภาพ</th>
                <th className="px-6 py-4">เวลา</th>
                <th className="px-6 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">กำลังโหลด...</td>
                </tr>
              )}
              {!loading && jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    ยังไม่มี Job — กด New Job เพื่อเริ่มวิเคราะห์
                  </td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-600">{job.id.slice(0, 8)}…</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 capitalize">{job.engine ?? "-"}</span>
                      <span className="text-xs font-mono text-slate-400 mt-0.5">{job.model ?? "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-xs font-semibold rounded-lg">
                      {job.progress.total} รูป
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{formatTime(job.submitted_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-950 hover:underline transition-all pr-2"
                    >
                      ดูผล
                    </Link>
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
