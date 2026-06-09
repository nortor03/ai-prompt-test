"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToCompareRoute() {
  const router = useRouter();
  useEffect(() => { router.replace("/compare/route"); }, [router]);
  return null;
}
