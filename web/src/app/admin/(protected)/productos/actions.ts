"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { extractProductImagePath } from "@/lib/storage";

export type ProductoInput = {
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string | null;
  activo: boolean;
  talles: Record<string, number>;
  imagenes: string[];
};

export async function crearProducto(data: ProductoInput) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").insert(data);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function actualizarProducto(id: string, data: ProductoInput) {
  const supabase = await createSupabaseServerClient();
  const { data: actualizados, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!actualizados || actualizados.length === 0) {
    throw new Error("No se pudo actualizar el producto (¿la sesión sigue activa?)");
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  revalidatePath("/");
}

export async function eliminarProducto(id: string, imagenes: string[]) {
  const supabase = await createSupabaseServerClient();

  const paths = imagenes
    .map(extractProductImagePath)
    .filter((p): p is string => p !== null);
  if (paths.length > 0) {
    await supabase.storage.from("products").remove(paths);
  }

  const { data: eliminados, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!eliminados || eliminados.length === 0) {
    throw new Error("No se pudo eliminar el producto (¿la sesión sigue activa?)");
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
}
