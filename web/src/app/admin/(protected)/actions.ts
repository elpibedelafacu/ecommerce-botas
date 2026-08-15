"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ESTADOS_VALIDOS = ["pendiente", "pagado", "enviado", "cancelado"];

export async function actualizarEstado(id: string, formData: FormData) {
  const estado = formData.get("estado");

  if (typeof estado !== "string" || !ESTADOS_VALIDOS.includes(estado)) {
    throw new Error(`Estado inválido: ${estado}`);
  }

  const supabase = await createSupabaseServerClient();

  if (estado === "cancelado") {
    // cancelar_pedido() devuelve el stock de cada ítem y marca el pedido
    // como cancelado en una sola transacción (ver 0013).
    const { error } = await supabase.rpc("cancelar_pedido", { p_id: id });
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("orders")
      .update({ estado })
      .eq("id", id)
      .select("id");

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error("No se pudo actualizar el pedido (¿la sesión sigue activa?)");
    }
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}

export async function cerrarSesion() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
