"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecoveryRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const esRecuperacion =
      hash.includes("type=recovery") || params.get("type") === "recovery";

    if (esRecuperacion) {
      router.replace(`/admin/reset-password${window.location.search}${hash}`);
    }
  }, [router]);

  return null;
}
