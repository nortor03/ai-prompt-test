"use client";

import { useState } from "react";

export interface ImageItem {
  id: string;
  name: string;
}

interface Props {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  emptyMessage?: string;
}

const getImageUrl = (name: string): string => {
  const lowercase = name.toLowerCase();
  if (lowercase.includes("road") || lowercase.includes("street") || lowercase.includes("crosswalk")) {
    return "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&auto=format&fit=crop&q=80";
  }
  if (lowercase.includes("drainage") || lowercase.includes("trees") || lowercase.includes("waste") || lowercase.includes("environment") || lowercase.includes("grate") || lowercase.includes("bin")) {
    return "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&auto=format&fit=crop&q=80";
  }
  if (lowercase.includes("power") || lowercase.includes("lines") || lowercase.includes("hawker") || lowercase.includes("sidewalk") || lowercase.includes("bicycle") || lowercase.includes("obstacle")) {
    return "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1506521788723-868126d5e368?w=300&auto=format&fit=crop&q=80";
};

export default function DraggableImageList({ images, onChange, emptyMessage = "ไม่มีรูปภาพในรายการ" }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...images];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    onChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-200">
      {images.map((img, index) => (
        <div
          key={img.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center justify-between p-4 transition-colors cursor-grab active:cursor-grabbing select-none ${
            dragOverIndex === index && dragIndex !== index
              ? "bg-indigo-50 border-t-2 border-indigo-400"
              : dragIndex === index
              ? "opacity-40"
              : "hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 shrink-0">
              {img.id}
            </span>
            
            {/* Thumbnail Image Preview */}
            <div className="w-24 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 select-none">
              <img
                src={getImageUrl(img.name)}
                alt={img.name}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>

            <p className="text-sm font-medium text-slate-800">{img.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#ef4444" }}
              aria-label="ลบรูปภาพ"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 3.5h9M6 3.5V2.5h3v1M5.5 6v5M9.5 6v5M4 3.5l.5 9h6l.5-9" />
              </svg>
            </button>
            <div className="text-slate-300 hover:text-slate-500 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="5" cy="3.5" r="1.4" />
                <circle cx="11" cy="3.5" r="1.4" />
                <circle cx="5" cy="8" r="1.4" />
                <circle cx="11" cy="8" r="1.4" />
                <circle cx="5" cy="12.5" r="1.4" />
                <circle cx="11" cy="12.5" r="1.4" />
              </svg>
            </div>
          </div>
        </div>
      ))}

      {images.length === 0 && (
        <div className="text-center py-12 text-sm text-slate-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
