"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DraggableImageList, { ImageItem } from "@/app/components/DraggableImageList";
import ImageUploadBar from "@/app/components/ImageUploadBar";

export default function RouteImageManagerPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.id; // ดึง ID ของ Route จาก URL

  // ข้อมูลจำลองของรูปภาพตาม Route ID
  const getInitialImages = (id: string | string[] | undefined): ImageItem[] => {
    if (id === "road-dimension") {
      return [
        { id: "IMG-001", name: "soi_subdivision_narrow_road.jpg" },
        { id: "IMG-002", name: "main_street_crosswalk.jpg" },
        { id: "IMG-003", name: "asphalt_road_with_sidewalk.png" },
      ];
    }
    if (id === "community-environment") {
      return [
        { id: "IMG-001", name: "drainage_grate_clogged.jpg" },
        { id: "IMG-002", name: "residential_frontage_trees.jpg" },
        { id: "IMG-003", name: "alleyway_waste_bin_overflow.jpg" },
        { id: "IMG-004", name: "public_park_greenery_boundary.png" },
        { id: "IMG-005", name: "street_lighting_pole_night.jpg" },
      ];
    }
    if (id === "footpath-obstacles") {
      return [
        { id: "IMG-001", name: "entangled_overhead_power_lines.jpg" },
        { id: "IMG-002", name: "hawker_stalls_blocking_sidewalk.png" },
        { id: "IMG-003", name: "abandoned_bicycle_on_walkway.jpg" },
      ];
    }
    return [
      { id: "IMG-001", name: "community_default_view.jpg" }
    ];
  };

  const [images, setImages] = useState<ImageItem[]>(() => getInitialImages(routeId));

  // ฟังก์ชันเพิ่มรูปภาพใหม่ (จะไปต่อแถวล่างสุดเสมอ)
  const handleAddNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // สร้างอ็อบเจกต์รูปภาพจำลองตัวใหม่
      const newImage: ImageItem = {
        id: `IMG-00${images.length + 1}`, // รันไอดีต่อกันไปเรื่อยๆ
        name: file.name, // ดึงชื่อไฟล์จริงที่ผู้ใช้อัปโหลดมา
      };

      setImages([...images, newImage]);
    }
  };

  const handleSave = () => {
    console.log("บันทึกการจัดเรียงและรูปภาพใหม่ของ Route ID:", routeId, images);
    alert("บันทึกการจัดเรียงข้อมูลรูปภาพสำเร็จ!");
    router.push("/routes");
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* ส่วนหัวหน้า */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Route ID: {routeId}</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">จัดการรูปภาพใน Route</h1>
          <p className="text-sm text-slate-500 mt-1">คุณสามารถสลับตำแหน่งการเรียงลำดับ หรืออัปโหลดรูปภาพเพิ่มเข้าสู่คลังข้อมูลนี้</p>
        </div>

        {/* ปุ่มย้อนกลับแบบเพลนๆ */}
        <button onClick={() => router.push("/routes")} className="text-xs font-medium text-slate-500 hover:text-slate-950 hover:underline">
          กลับไปหน้าหลัก
        </button>
      </div>

      <ImageUploadBar onFileSelect={handleAddNewImage} className="mb-6" />

      <DraggableImageList
        images={images}
        onChange={setImages}
        emptyMessage="ไม่มีรูปภาพอยู่ในคลังของ Route นี้"
      />

      {/* ปุ่ม Save บันทึกการเปลี่ยนแปลงภาพรวมทั้งหมดอยู่ขวาล่าง */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
        >
          Save
        </button>
      </div>

    </div>
  );
}