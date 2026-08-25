import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { crearPreferenciaMP, mercadoPagoDisponible } from "@/lib/mercadopago";

export async function POST(req: Request) {
  if (!mercadoPagoDisponible()) {
    return NextResponse.json(
      { error: "El pago con tarjeta no está disponible en este momento." },
      { status: 503 }
    );
  }

  const { orderId } = await req.json();
  if (typeof orderId !== "string") {
    return NextResponse.json({ error: "Falta el id del pedido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: pedido, error } = await supabase
    .from("orders")
    .select("id, total, metodo_pago")
    .eq("id", orderId)
    .single();

  if (error || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }
  if (pedido.metodo_pago !== "mercadopago") {
    return NextResponse.json({ error: "El pedido no usa Mercado Pago." }, { status: 400 });
  }

  try {
    const siteUrl = new URL(req.url).origin;
    const initPoint = await crearPreferenciaMP({
      orderId: pedido.id,
      descripcion: `Pedido Shekina #${pedido.id.slice(0, 8)}`,
      total: Number(pedido.total),
      siteUrl,
    });

    return NextResponse.json({ initPoint });
  } catch (err) {
    console.error("Error creando preferencia de Mercado Pago", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Mercado Pago." },
      { status: 502 }
    );
  }
}
