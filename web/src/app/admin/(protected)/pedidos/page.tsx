import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Order, OrderEstado } from "@/lib/types";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

const ESTADOS: OrderEstado[] = ["pendiente", "pagado", "enviado", "cancelado"];

function estadoHref(estado?: string) {
  return estado ? `/admin/pedidos?estado=${estado}` : "/admin/pedidos";
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (estado) query = query.eq("estado", estado);

  const { data: pedidos, error } = await query;

  return (
    <div>
      <h1 className="font-serif text-2xl">Pedidos</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={estadoHref()}
          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.1em] transition ${
            !estado
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-foreground/40"
          }`}
        >
          Todos
        </Link>
        {ESTADOS.map((e) => (
          <Link
            key={e}
            href={estadoHref(e)}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.1em] transition ${
              estado === e
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-foreground/40"
            }`}
          >
            {e}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive">
          Error al cargar los pedidos: {error.message}
        </p>
      )}

      {!error && (pedidos as Order[] | null)?.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No hay pedidos.</p>
      )}

      {!error && pedidos && pedidos.length > 0 && (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {(pedidos as Order[]).map((pedido) => (
            <li key={pedido.id}>
              <Link
                href={`/admin/pedidos/${pedido.id}`}
                className="flex items-center justify-between gap-4 py-4 transition hover:bg-secondary/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{pedido.cliente?.nombre}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatoFecha.format(new Date(pedido.created_at))} · #
                    {pedido.id.slice(0, 8)} ·{" "}
                    {pedido.metodo_pago === "mercadopago" ? "Mercado Pago" : "Transferencia"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-sm font-semibold">
                    {formatoPrecio.format(pedido.total)}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    {pedido.estado}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
