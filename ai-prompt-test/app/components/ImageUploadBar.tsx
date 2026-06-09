"use client";

interface Props {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  description?: string;
  className?: string;
  multiple?: boolean;
}

export default function ImageUploadBar({
  onFileSelect,
  title = "เพิ่มรูปภาพใหม่เข้าสู่ระบบ",
  description = "ไฟล์ที่เลือกจะถูกจัดลำดับไปอยู่ที่ส่วนท้ายสุดของรายการ",
  className = "",
  multiple = false,
}: Props) {
  return (
    <div className={`p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 font-medium text-xs rounded-xl transition-all shadow-sm">
        เลือกไฟล์รูปภาพ
        <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onFileSelect} />
      </label>
    </div>
  );
}
