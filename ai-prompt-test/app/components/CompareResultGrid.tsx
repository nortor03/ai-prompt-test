"use client";

export interface ResultColumn {
  engine: string;
  model: string;
  filename?: string;
  imageUrl?: string;
  analysis: Record<string, unknown> | null;
  error?: string;
}

export interface ImageOption {
  index: number;
  filename: string;
}

interface Props {
  columns: ResultColumn[];
  showImageNav?: boolean;
  imageOptions?: ImageOption[];
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
  minColumnWidth?: string;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function AnalysisContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-3 text-sm">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined) return null;

        if (typeof value === "object" && !Array.isArray(value)) {
          return (
            <div key={key}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {key.replace(/_/g, " ")}
              </p>
              <div className="space-y-1 pl-2 border-l-2 border-slate-100">
                {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="text-slate-400 font-mono shrink-0 min-w-[120px]">{k}</span>
                    <span className="text-slate-700 font-medium">{renderValue(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {key.replace(/_/g, " ")}
              </p>
              <div className="space-y-0.5 pl-2">
                {(value as unknown[]).map((item, i) => (
                  <p key={i} className="text-xs text-slate-700">{renderValue(item)}</p>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={key} className="flex gap-2 text-xs">
            <span className="text-slate-400 font-mono shrink-0 min-w-[120px]">{key.replace(/_/g, " ")}</span>
            <span className="text-slate-700 font-medium">{renderValue(value)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CompareResultGrid({
  columns,
  showImageNav = false,
  imageOptions = [],
  currentImageIndex = 0,
  onImageChange,
  minColumnWidth,
}: Props) {
  return (
    <div>
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
            {imageOptions.map((img) => (
              <option key={img.index} value={img.index}>{img.filename}</option>
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

      <div
        className={`border border-slate-200 rounded-2xl shadow-sm ${minColumnWidth ? "overflow-x-auto" : "overflow-hidden"}`}
        style={{
          display: "grid",
          gridTemplateColumns: minColumnWidth
            ? `repeat(${columns.length}, minmax(${minColumnWidth}, 1fr))`
            : `repeat(${columns.length}, 1fr)`,
        }}
      >
        {columns.map((col, i) => (
          <div
            key={i}
            className="flex flex-col"
            style={{ borderLeft: i > 0 ? "1px solid #e2e8f0" : undefined }}
          >
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              {col.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={col.imageUrl}
                  alt={col.filename ?? "image"}
                  className="w-full h-auto max-h-80 object-contain rounded-lg border border-slate-200 mb-2 bg-slate-50"
                />
              )}
              {col.engine && (
                <span className="inline-block text-xs font-mono font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                  {col.engine} — {col.model}
                </span>
              )}
              {col.filename && (
                <p className="text-xs text-slate-400 font-mono mt-1 truncate">{col.filename}</p>
              )}
            </div>
            <div className="p-4 flex-1 bg-white overflow-y-auto max-h-[60vh]">
              {col.error ? (
                <p className="text-sm text-red-600">Error: {col.error}</p>
              ) : col.analysis ? (
                <AnalysisContent data={col.analysis} />
              ) : (
                <p className="text-sm text-slate-400">ไม่มีข้อมูล</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
