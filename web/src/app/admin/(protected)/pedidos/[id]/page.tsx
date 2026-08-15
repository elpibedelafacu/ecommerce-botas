import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Order, OrderEstado } from "@/lib/types";
import { actualizarEstado } from "../../actions";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
});

const ESTADOS: OrderEstado[] = ["pendiente", "pagado", "enviado", "cancelado"];

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: pedido } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single<Order>();

  if (!pedido) notFound();

  const productIds = Array.from(new Set(pedido.items.map((i) => i.product_id)));
  const { data: productos } = await supabase
    .from("products")
    .select("id, nombre")
    .in("id", productIds);

  const nombrePorId = new Map((productos ?? []).map((p) => [p.id, p.nombre]));

  return (
    <div>
      <Link
        href="/admin/pedidos"
        className="text-xs uppercase tracking-[0.15em] text-muted-foreground transition hover:text-foreground"
      >
        ← Pedidos
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Pedido #{pedido.id.slice(0, 8)}</h1>
        <form action={actualizarEstado.bind(null, pedido.id)} className="flex gap-2">
          <select
            key={pedido.estado}
            name="estado"
            defaultValue={pedido.estado}
            className="rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e} className="bg-background">
                {e}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Actualizar
          </button>
        </form>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {formatoFecha.format(new Date(pedido.created_at))}
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Cliente
          </h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd>{pedido.cliente.nombre}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{pedido.cliente.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Teléfono</dt>
              <dd>{pedido.cliente.telefono}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Dirección</dt>
              <dd className="text-right">{pedido.cliente.direccion}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Ítems
          </h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {pedido.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p>{nombrePorId.get(item.product_id) ?? item.product_id}</p>
                  <p className="text-xs text-muted-foreground">
                    Talle {item.talle} · x{item.cantidad}
                  </p>
                </div>
                <span className="font-medium">
                  {formatoPrecio.format(item.precio_unit * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">
              {formatoPrecio.format(pedido.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
