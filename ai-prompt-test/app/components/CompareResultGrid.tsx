"use client";

import PromptTooltip from "@/app/components/PromptTooltip";
import { promptFullTextByName } from "@/app/data/prompts";

export interface ResultColumn {
  provider: string;
  model: string;
  promptName: string;
  imageUrl: string;
  aiResponse: string;
}

export interface ImageOption {
  id: string;
  name: string;
}

interface Props {
  columns: ResultColumn[];
  showImageNav?: boolean;
  imageOptions?: ImageOption[];
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
}

export default function CompareResultGrid({
  columns,
  showImageNav = false,
  imageOptions = [],
  currentImageIndex = 0,
  onImageChange,
}: Props) {
  return (
    <div>
      {/* Image navigator (route mode only) */}
      {showImageNav && imageOptions.length > 0 && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <button
            onClick={() => onImageChange?.(Math.max(0, currentImageIndex - 1))}
            disabled={currentImageIndex === 0}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← ก่อนหน้า
          </button>

          <select
            value={currentImageIndex}
            onChange={(e) => onImageChange?.(Number(e.target.value))}
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 cursor-pointer focus:outline-none focus:border-slate-950 font-mono"
          >
            {imageOptions.map((img, i) => (
              <option key={img.id} value={i}>{img.id} — {img.name}</option>
            ))}
          </select>

          <span className="text-xs text-slate-400 font-mono shrink-0">
            {currentImageIndex + 1} / {imageOptions.length}
          </span>

          <button
            onClick={() => onImageChange?.(Math.min(imageOptions.length - 1, currentImageIndex + 1))}
            disabled={currentImageIndex === imageOptions.length - 1}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-950 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ถัดไป →
          </button>
        </div>
      )}

      {/* Result columns */}
      <div
        className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map((col, i) => (
          <div
            key={i}
            className="flex flex-col"
            style={{ borderLeft: i > 0 ? "1px solid #e2e8f0" : undefined }}
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <span className="inline-block text-xs font-mono font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                {col.provider} — {col.model}
              </span>
              <PromptTooltip
                name={col.promptName}
                fullText={promptFullTextByName[col.promptName] ?? col.promptName}
                className="text-sm font-semibold text-slate-800 mt-2 leading-snug block"
              />
            </div>

            {/* Image */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                <img src={col.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* AI Response */}
            <div className="p-4 flex-1 bg-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ผลลัพธ์จาก AI</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{col.aiResponse}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
