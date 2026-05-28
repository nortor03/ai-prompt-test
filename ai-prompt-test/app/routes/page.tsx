"use client";

import Link from "next/link";
import { useState } from "react";
import RouteTable, { RouteTableItem } from "@/app/components/RouteTable";

export default function RouteSettingsPage() {
  const [routes] = useState<RouteTableItem[]>([
    { id: "road-dimension", name: "ตรวจวัดขนาดถนนและช่องทางเดินรถ (Road Dimensions)", totalImages: 3 },
    { id: "community-environment", name: "ตรวจจับสภาพแวดล้อมรอบข้างในชุมชน (Community Environment)", totalImages: 5 },
    { id: "footpath-obstacles", name: "ตรวจพบสิ่งกีดขวางบนทางเท้าและเสาไฟฟ้า (Footpath Obstacles)", totalImages: 3 },
  ]);

  return (
    <div className="max-w-4xl mx-auto">

      {/* ส่วนหัวหน้าเว็บ */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">จัดการ Route (Route Settings)</h1>
          <p className="text-sm text-slate-500 mt-1">
            ดูรายการคลังเส้นทาง และจัดการลำดับรูปภาพที่จะใช้ยิงทดสอบร่วมกับ AI Prompt
          </p>
        </div>
        <Link
          href="/routes/upload"
          className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shrink-0"
        >
          Upload New Route
        </Link>
      </div>

      <RouteTable
        routes={routes}
        actionLabel="edit"
        actionHref={(id) => `/routes/${id}`}
      />

    </div>
  );
}
