"use client";

const selectClass =
  "w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950";

interface Props {
  providers: string[];
  selectedProvider: string;
  onProviderChange: (value: string) => void;

  models: string[];
  selectedModel: string;
  onModelChange: (value: string) => void;

  prompts: string[];
  selectedPrompt: string;
  onPromptChange: (value: string) => void;

  className?: string;
}

export default function ConfigFilterBar({
  providers,
  selectedProvider,
  onProviderChange,
  models,
  selectedModel,
  onModelChange,
  prompts,
  selectedPrompt,
  onPromptChange,
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="flex-1 min-w-0">
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">ทุกค่าย AI</option>
          {providers.map((p) => (
            <option key={p} value={p}>{p}</option>
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

      <div className="flex-1 min-w-0">
        <select
          value={selectedPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">ทุก Prompt</option>
          {prompts.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
