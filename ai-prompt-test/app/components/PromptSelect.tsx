"use client";

import { useEffect, useState } from "react";
import { getPrompts, Prompt } from "@/app/lib/api";

/**
 * Dropdown for picking a prompt from the library. An empty value ("") means
 * "use the system default prompt" — the backend falls back to its built-in
 * prompt when no prompt_id is sent.
 */
export default function PromptSelect({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (promptId: string) => void;
  className?: string;
}) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrompts()
      .then((r) => setPrompts(r.prompts))
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={className}
    >
      <option value="">ค่าเริ่มต้นของระบบ (built-in)</option>
      {prompts.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
