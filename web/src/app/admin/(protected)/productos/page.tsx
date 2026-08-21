import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Product } from "@/lib/types";
import { stockTotal } from "@/lib/product";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

function activoHref(activo?: string) {
  return activo ? `/admin/productos?activo=${activo}` : "/admin/productos";
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ activo?: string }>;
}) {
  const { activo } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (activo === "true") query = query.eq("activo", true);
  if (activo === "false") query = query.eq("activo", false);

  const { data: productos, error } = await query;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Nuevo producto
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={activoHref()}
          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.1em] transition ${
            !activo
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-foreground/40"
          }`}
        >
          Todos
        </Link>
        <Link
          href={activoHref("true")}
          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.1em] transition ${
            activo === "true"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-foreground/40"
          }`}
        >
          Activos
        </Link>
        <Link
          href={activoHref("false")}
          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.1em] transition ${
            activo === "false"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-foreground/40"
          }`}
        >
          Inactivos
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive">
          Error al cargar los productos: {error.message}
        </p>
      )}

      {!error && (productos as Product[] | null)?.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No hay productos.</p>
      )}

      {!error && productos && productos.length > 0 && (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {(productos as Product[]).map((producto) => (
            <li key={producto.id}>
              <Link
                href={`/admin/productos/${producto.id}`}
                className="flex items-center gap-4 py-4 transition hover:bg-secondary/50"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-muted to-card">
                  {producto.imagenes?.[0] ? (
                    <Image
                      src={producto.imagenes[0]}
                      alt={producto.nombre}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{producto.nombre}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {producto.categoria ?? "Sin categoría"} · Stock total:{" "}
                    {stockTotal(producto.talles)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-sm font-semibold">
                    {formatoPrecio.format(producto.precio)}
                  </span>
                  {producto.destacado && (
                    <span className="rounded-full border border-gold px-2.5 py-1 text-xs uppercase tracking-[0.1em] text-gold">
                      destacado
                    </span>
                  )}
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs uppercase tracking-[0.1em] ${
                      producto.activo
                        ? "border-border text-muted-foreground"
                        : "border-destructive/40 text-destructive"
                    }`}
                  >
                    {producto.activo ? "activo" : "inactivo"}
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
