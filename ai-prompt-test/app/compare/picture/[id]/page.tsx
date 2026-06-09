"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToComparePicture() {
  const router = useRouter();
  useEffect(() => { router.replace("/compare/picture"); }, [router]);
  return null;
}
