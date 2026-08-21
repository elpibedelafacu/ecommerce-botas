import Image from "next/image";
import type { Product } from "@/lib/types";
import { stockTotal } from "@/lib/product";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const UMBRAL_ULTIMAS_UNIDADES = 3;
const DIAS_NOVEDAD = 14;

function esNovedad(createdAt: string) {
  const dias = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return dias <= DIAS_NOVEDAD;
}

export default function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  const stock = stockTotal(product.talles);
  const sinStock = stock <= 0;
  const ultimasUnidades = !sinStock && stock <= UMBRAL_ULTIMAS_UNIDADES;
  const imagen = product.imagenes?.[0];

  return (
    <div className="group text-left">
      <div className="transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-gradient-to-br from-muted to-card ring-1 ring-transparent transition-all duration-300 group-hover:ring-gold">
          <button
            type="button"
            onClick={onSelect}
            aria-label={product.nombre}
            className="absolute inset-0"
          >
            {imagen ? (
              <Image
                src={imagen}
                alt={product.nombre}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin imagen
              </div>
            )}
          </button>

          <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
            {sinStock && (
              <span className="rounded bg-background/80 px-2 py-1 text-xs">
                Sin stock
              </span>
            )}
            {ultimasUnidades && (
              <span className="rounded bg-destructive/90 px-2 py-1 text-xs text-white">
                Últimas unidades
              </span>
            )}
            {esNovedad(product.created_at) && (
              <span className="rounded bg-gold px-2 py-1 text-xs text-gold-foreground">
                Novedad
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onSelect}
            aria-label={`Elegir talle de ${product.nombre}`}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition hover:opacity-90"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="mt-3 flex w-full items-baseline justify-between gap-2 text-left"
        >
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg">{product.nombre}</h3>
            {product.categoria && (
              <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                {product.categoria}
              </p>
            )}
          </div>
          <p className="flex-shrink-0 text-sm font-semibold text-gold">
            {formatoPrecio.format(product.precio)}
          </p>
        </button>
      </div>
    </div>
  );
}
