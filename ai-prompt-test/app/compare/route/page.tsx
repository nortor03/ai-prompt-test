"use client";

import { useState } from "react";
import RouteTable, { RouteTableItem } from "@/app/components/RouteTable";

export default function CompareRoutesDashboardPage() {
  const [routes] = useState<RouteTableItem[]>([
    { id: "road-dimension", name: "ตรวจวัดขนาดถนนและช่องทางเดินรถ (Road Dimensions)", totalImages: 3 },
    { id: "community-environment", name: "ตรวจจับสภาพแวดล้อมรอบข้างในชุมชน (Community Environment)", totalImages: 5 },
    { id: "footpath-obstacles", name: "ตรวจพบสิ่งกีดขวางบนทางเท้าและเสาไฟฟ้า (Footpath Obstacles)", totalImages: 3 },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-2">

      {/* ส่วนหัวหน้าเว็บ */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">เปรียบเทียบด้วย Route</h1>
        <p className="text-sm text-slate-500 mt-1">
          เลือกคลัง Route รูปภาพที่คุณต้องการนำไปทดสอบเปรียบเทียบผลลัพธ์การตอบกลับของ AI
        </p>
      </div>

      <RouteTable
        routes={routes}
        actionLabel="compare"
        actionHref={(id) => `/compare/route/${id}`}
      />

    </div>
  );
}
