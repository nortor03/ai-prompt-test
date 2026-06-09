"use client";

const selectClass =
  "w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950";

interface Props {
  engines: string[];
  selectedEngine: string;
  onEngineChange: (value: string) => void;

  models: string[];
  selectedModel: string;
  onModelChange: (value: string) => void;

  className?: string;
}

export default function ConfigFilterBar({
  engines,
  selectedEngine,
  onEngineChange,
  models,
  selectedModel,
  onModelChange,
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="flex-1 min-w-0">
        <select
          value={selectedEngine}
          onChange={(e) => onEngineChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">ทุก Engine</option>
          {engines.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-0">
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">ทุกโมเดล</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
