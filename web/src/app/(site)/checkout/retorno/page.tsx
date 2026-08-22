import Link from "next/link";

const MENSAJES = {
  success: {
    titulo: "¡Pago aprobado!",
    texto: "Ya confirmamos tu pago. En breve te contactamos para coordinar el envío.",
  },
  pending: {
    titulo: "Pago pendiente",
    texto:
      "Tu pago está siendo procesado. Te vamos a avisar por email apenas se confirme.",
  },
  failure: {
    titulo: "El pago no se pudo procesar",
    texto:
      "Algo falló con Mercado Pago y no se completó el cobro. Podés volver a intentarlo o elegir transferencia.",
  },
} as const;

export default async function RetornoPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const mensaje =
    MENSAJES[estado as keyof typeof MENSAJES] ??
    {
      titulo: "Gracias por tu compra",
      texto: "Te vamos a contactar para confirmar el estado de tu pedido.",
    };

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">{mensaje.titulo}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{mensaje.texto}</p>
      <Link href="/coleccion" className="mt-8 text-sm font-medium underline underline-offset-4">
        Volver al catálogo
      </Link>
    </main>
  );
}
