"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToEngines() {
  const router = useRouter();
  useEffect(() => { router.replace("/ai-engines"); }, [router]);
  return null;
}
