"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CompareResultGrid, { ResultColumn, ImageOption } from "@/app/components/CompareResultGrid";

const availableConfigs = [
  { id: "c1", provider: "ChatGPT", model: "gpt-4o", promptName: "วิเคราะห์ความกว้างของถนนในซอย (Road Width)" },
  { id: "c2", provider: "ChatGPT", model: "gpt-4o-mini", promptName: "วิเคราะห์ความกว้างของถนนในซอย (Road Width)" },
  { id: "c3", provider: "Claude", model: "claude-sonnet-4-6", promptName: "วิเคราะห์ความกว้างของถนนในซอย (Road Width)" },
  { id: "c4", provider: "Gemini", model: "gemini-2.0-flash", promptName: "ตรวจจับสิ่งชำรุดรอบชุมชน (Infrastructure Defects)" },
  { id: "c5", provider: "ChatGPT", model: "o1", promptName: "ตรวจจับสิ่งชำรุดรอบชุมชน (Infrastructure Defects)" },
  { id: "c6", provider: "Claude", model: "claude-opus-4-7", promptName: "วิเคราะห์และแยกแยะสิ่งกีดขวางบนทางเท้า (Sidewalk Obstacles)" },
];

const routeImages: Record<string, ImageOption & { url: string }[]> = {
  "road-dimension": [
    { id: "IMG-001", name: "soi_narrow_road_01.jpg", url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80" },
    { id: "IMG-002", name: "soi_entrance_gate.jpg", url: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80" },
    { id: "IMG-003", name: "road_lane_view.jpg", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80" },
  ],
  "community-environment": [
    { id: "IMG-001", name: "drainage_grate_blocked.jpg", url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80" },
    { id: "IMG-002", name: "broken_pavement.jpg", url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80" },
    { id: "IMG-003", name: "cracked_wall.jpg", url: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop&q=80" },
    { id: "IMG-004", name: "stagnant_water.jpg", url: "https://images.unsplash.com/photo-1461696114087-397271a7aedc?w=800&auto=format&fit=crop&q=80" },
    { id: "IMG-005", name: "community_waste.jpg", url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&auto=format&fit=crop&q=80" },
  ],
  "footpath-obstacles": [
    { id: "IMG-001", name: "entangled_power_lines.jpg", url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80" },
    { id: "IMG-002", name: "footpath_blocked.jpg", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80" },
    { id: "IMG-003", name: "pole_obstruction.jpg", url: "https://images.unsplash.com/photo-1506521788723-868126d5e368?w=800&auto=format&fit=crop&q=80" },
  ],
};

const mockResponses: Record<string, string> = {
  ChatGPT: "ความกว้างของช่องทางเดินรถวัดได้ประมาณ 3.2 เมตร รองรับรถยนต์ได้ 1 คัน ไม่เพียงพอสำหรับการสวนกัน แนะนำกำหนดทิศทางเดินรถทางเดียวและติดป้ายเตือน",
  Claude: "จากการวิเคราะห์ภาพ พบความกว้างของซอยอยู่ที่ประมาณ 3–3.5 เมตร ซึ่งต่ำกว่ามาตรฐานขั้นต่ำของซอยสองทาง (4 เมตร) ควรพิจารณาปรับปรุงโดยติดตั้งกระจกโค้งและสัญลักษณ์จราจรบริเวณทางเข้า",
  Gemini: "• ความกว้างโดยประมาณ: 3.2 ม.\n• ประเภท: ซอยแคบ\n• ความจุ: รถ 1 คัน\n• ความเสี่ยง: ปานกลาง\n• คำแนะนำ: กำหนดทิศทางเดินรถทางเดียว ติดกระจกโค้งมุม",
};

export default function RouteCompareResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const routeId = params.id as string;
  const configIds = searchParams.get("configs")?.split(",") ?? [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = routeImages[routeId] ?? [];
  const currentImage = images[currentImageIndex];

  const selectedConfigs = configIds
    .map((id) => availableConfigs.find((c) => c.id === id))
    .filter(Boolean) as typeof availableConfigs;

  const columns: ResultColumn[] = selectedConfigs.map((config) => ({
    provider: config.provider,
    model: config.model,
    promptName: config.promptName,
    imageUrl: currentImage?.url ?? "",
    aiResponse: mockResponses[config.provider] ?? "กำลังประมวลผล...",
  }));

  return (
    <div className="max-w-6xl mx-auto px-2">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Route: {routeId}</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">ผลลัพธ์การเปรียบเทียบ</h1>
          <p className="text-sm text-slate-500 mt-1">เปรียบเทียบผลลัพธ์จาก {selectedConfigs.length} โมเดลในรูปภาพเดียวกัน</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs font-medium text-slate-500 hover:text-slate-950 hover:underline shrink-0"
        >
          ← กลับ
        </button>
      </div>

      <CompareResultGrid
        columns={columns}
        showImageNav={true}
        imageOptions={images.map(({ id, name }) => ({ id, name }))}
        currentImageIndex={currentImageIndex}
        onImageChange={setCurrentImageIndex}
      />

    </div>
  );
}
