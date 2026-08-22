"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function actualizarHeroImagen(url: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ value: url, updated_at: new Date().toISOString() })
    .eq("key", "hero_image_url");

  if (error) return { error: error.message };

  revalidatePath("/");
  return {};
}
