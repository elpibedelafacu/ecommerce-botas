"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecoveryRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.slice(1));
    const params = new URLSearchParams(window.location.search);
    const esRecuperacion =
      hash.includes("type=recovery") ||
      params.get("type") === "recovery" ||
      hashParams.has("error_code") ||
      params.has("error_code");

    if (esRecuperacion) {
      router.replace(`/admin/reset-password${window.location.search}${hash}`);
    }
  }, [router]);

  return null;
}
