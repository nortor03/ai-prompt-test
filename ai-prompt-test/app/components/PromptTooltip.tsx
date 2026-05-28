"use client";

import { useState } from "react";

interface Props {
  name: string;
  fullText: string;
  className?: string;
}

export default function PromptTooltip({ name, fullText, className = "" }: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 240; // ประมาณความสูง tooltip
    const margin = 16;
    const left = Math.min(rect.left, window.innerWidth - tooltipWidth - margin);
    // ถ้าไม่มีที่ด้านล่าง ให้แสดงขึ้นบนแทน
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < tooltipHeight + margin
      ? rect.top - tooltipHeight - 8
      : rect.bottom + 8;
    setPos({ top, left });
  };

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPos(null)}
        className={className}
        style={{ cursor: "help" }}
      >
        {name}
      </span>

      {pos && (
        <div
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            width: 320,
            pointerEvents: "none",
          }}
          className="p-4 bg-slate-950 text-white text-xs rounded-xl shadow-2xl border border-slate-800"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prompt</p>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-200">{fullText}</p>
        </div>
      )}
    </>
  );
}
