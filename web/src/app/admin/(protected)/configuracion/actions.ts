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

export async function actualizarDatosTransferencia(datos: {
  alias: string;
  cbu: string;
  titular: string;
}) {
  const supabase = await createSupabaseServerClient();

  const filas = [
    { key: "transferencia_alias", value: datos.alias.trim() || null },
    { key: "transferencia_cbu", value: datos.cbu.trim() || null },
    { key: "transferencia_titular", value: datos.titular.trim() || null },
  ];

  for (const fila of filas) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value: fila.value, updated_at: new Date().toISOString() })
      .eq("key", fila.key);
    if (error) return { error: error.message };
  }

  revalidatePath("/checkout");
  revalidatePath("/admin/configuracion");
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

function revalidarCategorias() {
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/coleccion");
  revalidatePath("/");
}

export async function crearCategoria(nombre: string) {
  const limpio = nombre.trim();
  if (!limpio) return { error: "El nombre no puede estar vacío." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").insert({ nombre: limpio });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una categoría con ese nombre." };
    }
    return { error: error.message };
  }

  revalidarCategorias();
  return {};
}

export async function renombrarCategoria(id: string, nuevoNombre: string) {
  const limpio = nuevoNombre.trim();
  if (!limpio) return { error: "El nombre no puede estar vacío." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("renombrar_categoria", {
    p_id: id,
    p_nuevo_nombre: limpio,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una categoría con ese nombre." };
    }
    return { error: error.message };
  }

  revalidarCategorias();
  return {};
}

export async function eliminarCategoria(id: string, nombre: string) {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("categoria", nombre);

  if (count && count > 0) {
    return {
      error: `No se puede eliminar: ${count} producto${count === 1 ? "" : "s"} todavía usa${count === 1 ? "" : "n"} esta categoría.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidarCategorias();
  return {};
}
