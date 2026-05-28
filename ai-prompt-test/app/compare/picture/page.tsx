"use client";

import Link from "next/link";
import { useState } from "react";

interface ComparePictureItem {
  id: string;
  name: string;
  fromRoute: string;
  fromRouteId: string;
  thumbnailUrl: string; // แหล่งอ้างอิงรูปภาพจำลอง
}

export default function CompareByPictureDashboardPage() {
  // ข้อมูลจำลองของรูปภาพทั้งหมดจากทุก Route มารวมกันที่นี่
  const [pictures] = useState<ComparePictureItem[]>([
    {
      id: "IMG-001",
      name: "soi_subdivision_narrow_road.jpg",
      fromRoute: "ตรวจวัดขนาดถนนและช่องทางเดินรถ (Road Dimensions)",
      fromRouteId: "road-dimension",
      thumbnailUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=80&auto=format&fit=crop&q=60",
    },
    {
      id: "IMG-001",
      name: "drainage_grate_clogged.jpg",
      fromRoute: "ตรวจจับสภาพแวดล้อมรอบข้างในชุมชน (Community Environment)",
      fromRouteId: "community-environment",
      thumbnailUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=80&auto=format&fit=crop&q=60",
    },
    {
      id: "IMG-001",
      name: "entangled_overhead_power_lines.jpg",
      fromRoute: "ตรวจพบสิ่งกีดขวางบนทางเท้าและเสาไฟฟ้า (Footpath Obstacles)",
      fromRouteId: "footpath-obstacles",
      thumbnailUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=80&auto=format&fit=crop&q=60",
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-2">
      
      {/* ส่วนหัวหน้าเว็บ */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">เปรียบเทียบด้วยรูปภาพ</h1>
        <p className="text-sm text-slate-500 mt-1">
          เลือกรูปภาพเดี่ยวที่คุณต้องการ เพื่อนำไปยิงทดสอบวิเคราะห์และเปรียบเทียบผลลัพธ์จากค่าย AI ต่างๆ
        </p>
      </div>

      {/* ตารางมินิมอลขาว-เทา เรียบง่ายสไตล์เดิม */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 w-44 text-center">รูปภาพ</th>
                <th className="px-6 py-4">ชื่อรูปภาพ / ไอดี</th>
                <th className="px-6 py-4">มาจาก Route</th>
                <th className="px-6 py-4 w-24"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {pictures.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                    ยังไม่มีรูปภาพในระบบ — อัปโหลด Route และรูปภาพก่อนเพื่อเริ่มเปรียบเทียบ
                  </td>
                </tr>
              )}
              {pictures.map((pic) => (
                <tr key={`${pic.fromRouteId}-${pic.id}`} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* คอลลัมน์รูป Thumbnail ขนาดใหญ่ขึ้น ขอบมน */}
                  <td className="px-6 py-3 text-center">
                    <div className="w-32 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden inline-block shadow-sm">
                      <img 
                        src={pic.thumbnailUrl} 
                        alt={pic.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  
                  {/* ชื่อไฟล์และไอดีรูปภาพ */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{pic.name}</span>
                      <span className="text-[11px] font-mono text-slate-400 mt-0.5">{pic.id}</span>
                    </div>
                  </td>
                  
                  {/* แหล่งที่มาบอกว่ามาจาก Route ไหน */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60 text-xs font-medium">
                      {pic.fromRoute}
                    </span>
                  </td>
                  
                  {/* ปุ่ม compare ขีดเส้นใต้ตอนเท่ๆ สไตล์เดิม */}
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/compare/picture/${pic.fromRouteId}_${pic.id}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-950 hover:underline transition-all pr-2"
                    >
                      compare
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