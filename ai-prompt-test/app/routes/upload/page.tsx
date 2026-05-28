"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DraggableImageList, { ImageItem } from "@/app/components/DraggableImageList";
import ImageUploadBar from "@/app/components/ImageUploadBar";

export default function UploadRoutePage() {
  const router = useRouter();

  // State สำหรับเก็บข้อมูล Route และรูปภาพที่จะสร้างใหม่
  const [routeName, setRouteName] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);

  // ฟังก์ชันเพิ่มรูปภาพใหม่ (จะไปต่อแถวล่างสุดเสมอ)
  const handleAddNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const newImage: ImageItem = {
        id: `IMG-${String(images.length + 1).padStart(3, "0")}`, // รันไอดีต่อกัน เช่น IMG-001
        name: file.name,
      };

      setImages([...images, newImage]);
    }
  };

  // ฟังก์ชันกดบันทึกการสร้าง Route ใหม่
  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim()) {
      alert("กรุณากรอกชื่อ Route ก่อนบันทึก");
      return;
    }
    
    console.log("Creating New Route:", {
      name: routeName,
      images: images,
    });
    
    alert("อัปโหลดและสร้าง Route ใหม่สำเร็จ!");
    router.push("/routes"); // เมื่อบันทึกเสร็จ วิ่งกลับหน้าตารางรวม
  };

  return (
    <div className="max-w-4xl mx-auto px-2">
      
      {/* ส่วนหัวหน้า */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">อัปโหลด Route ใหม่ (Upload Route)</h1>
        <p className="text-sm text-slate-500 mt-1">ตั้งชื่อเส้นทางและอัปโหลดรูปภาพพร้อมจัดลำดับคลังข้อมูลสำหรับสร้าง Route ใหม่</p>
      </div>

      <form onSubmit={handleSaveRoute} className="space-y-6">
        
        {/* กล่องกรอก: ชื่อของ Route */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 px-0.5">
            ชื่อ Route / ชื่อคลังข้อมูล
          </label>
          <input
            type="text"
            required
            placeholder="เช่น OCR Invoice Dataset Route"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all"
          />
        </div>

        <ImageUploadBar onFileSelect={handleAddNewImage} title="เพิ่มรูปภาพเข้าสู่ Route" />

        {images.length > 0 && (
          <DraggableImageList images={images} onChange={setImages} />
        )}

        {/* ปุ่ม Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            บันทึกและสร้าง Route (Save)
          </button>
        </div>

      </form>
    </div>
  );
}
