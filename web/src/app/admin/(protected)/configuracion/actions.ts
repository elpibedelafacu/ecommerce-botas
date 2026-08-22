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

export async function actualizarDestacado(
  id: string,
  data: { destacado: boolean; precio: number }
) {
  if (!Number.isFinite(data.precio) || data.precio < 0 || data.precio > 99999999.99) {
    return { error: "El precio no es válido." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: actualizados, error } = await supabase
    .from("products")
    .update({ destacado: data.destacado, precio: data.precio })
    .eq("id", id)
    .select("id");

  if (error) return { error: error.message };
  if (!actualizados || actualizados.length === 0) {
    return { error: "No se pudo actualizar (¿la sesión sigue activa?)" };
  }

  revalidatePath("/");
  revalidatePath("/coleccion");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/configuracion");
  return {};
}
