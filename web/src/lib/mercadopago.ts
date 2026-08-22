const MP_API_URL = "https://api.mercadopago.com";

export function mercadoPagoDisponible() {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

export async function crearPreferenciaMP({
  orderId,
  descripcion,
  total,
  siteUrl,
}: {
  orderId: string;
  descripcion: string;
  total: number;
  siteUrl: string;
}) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Mercado Pago no está configurado en este entorno.");
  }

  const esHttps = siteUrl.startsWith("https://");

  const res = await fetch(`${MP_API_URL}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: descripcion,
          quantity: 1,
          unit_price: total,
          currency_id: "ARS",
        },
      ],
      external_reference: orderId,
      back_urls: {
        success: `${siteUrl}/checkout/retorno?estado=success`,
        pending: `${siteUrl}/checkout/retorno?estado=pending`,
        failure: `${siteUrl}/checkout/retorno?estado=failure`,
      },
      ...(esHttps ? { auto_return: "approved" } : {}),
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
    }),
  });

  if (!res.ok) {
    const texto = await res.text();
    throw new Error(`Error creando preferencia de Mercado Pago: ${texto}`);
  }

  const data = await res.json();
  return data.init_point as string;
}

export async function obtenerPagoMP(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Mercado Pago no está configurado en este entorno.");
  }

  const res = await fetch(`${MP_API_URL}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("No se pudo obtener el pago de Mercado Pago.");
  }

  return res.json();
}
