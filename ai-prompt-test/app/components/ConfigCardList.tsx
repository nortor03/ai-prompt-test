"use client";

import PromptTooltip from "@/app/components/PromptTooltip";
import { promptFullTextByName } from "@/app/data/prompts";

export interface ConfigItem {
  id: string;
  provider: string;
  model: string;
  promptName: string;
}

interface Props {
  configs: ConfigItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function ConfigCardList({ configs, selectedIds, onToggle }: Props) {
  if (configs.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
        ไม่พบข้อมูลโมเดลหรือ Prompt ที่ตรงตามเงื่อนไข
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
              <th className="w-12 px-6 py-4 text-center"></th>
              <th className="px-6 py-4">AI</th>
              <th className="px-6 py-4">Model</th>
              <th className="px-6 py-4">Prompt</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {configs.map((config) => {
              const isChecked = selectedIds.includes(config.id);
              return (
                <tr
                  key={config.id}
                  onClick={() => onToggle(config.id)}
                  className={`hover:bg-slate-50/80 cursor-pointer transition-all select-none ${
                    isChecked ? "bg-slate-50/50" : ""
                  }`}
                >
                  {/* คอลัมน์ checkbox เลือก */}
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="w-4 h-4 accent-slate-950 border-slate-300 rounded cursor-pointer"
                    />
                  </td>

                  {/* คอลัมน์ AI Provider */}
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {config.provider}
                  </td>

                  {/* คอลัมน์ Model */}
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {config.model}
                  </td>

                  {/* คอลัมน์ Prompt */}
                  <td className="px-6 py-4 text-slate-700">
                    <PromptTooltip
                      name={config.promptName}
                      fullText={promptFullTextByName[config.promptName] ?? config.promptName}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}
