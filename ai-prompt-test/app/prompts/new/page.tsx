"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPrompt } from "@/app/lib/api";
import PromptForm from "@/app/components/PromptForm";

export default function NewPromptPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto">

      <div className="mb-8">
        <Link href="/prompts" className="text-xs font-medium text-slate-400 hover:text-slate-700 hover:underline">
          ← กลับไปคลัง Prompt
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">New Prompt</h1>
        <p className="text-sm text-slate-500 mt-1">สร้าง prompt ใหม่สำหรับใช้วิเคราะห์รูปภาพ</p>
      </div>

      <PromptForm
        submitLabel="สร้าง Prompt"
        onSubmit={async (values) => {
          const created = await createPrompt(values);
          router.push(`/prompts/${created.id}`);
        }}
      />

    </div>
  );
}
