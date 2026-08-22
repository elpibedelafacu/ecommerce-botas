import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { mercadoPagoDisponible, obtenerPagoMP } from "@/lib/mercadopago";

export async function POST(req: Request) {
  if (!mercadoPagoDisponible()) {
    return NextResponse.json({ received: true });
  }

  const url = new URL(req.url);
  let body: { type?: string; data?: { id?: string } } | null = null;
  try {
    body = await req.json();
  } catch {
    // MP también puede notificar solo por query string
  }

  const tipo = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId = body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (tipo !== "payment" || !paymentId) {
    return NextResponse.json({ received: true });
  }

  try {
    const pago = await obtenerPagoMP(paymentId);

    if (pago.status === "approved" && pago.external_reference) {
      const supabase = createSupabaseAdminClient();
      await supabase.rpc("marcar_pedido_pagado", {
        p_id: pago.external_reference,
        p_mp_payment_id: String(paymentId),
      });
    }
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err);
    // devolvemos 200 igual: si respondemos error, MP reintenta indefinidamente
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
