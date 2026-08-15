import Image from "next/image";
import type { Product } from "@/lib/types";
import { stockTotal } from "@/lib/product";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  const sinStock = stockTotal(product.talles) <= 0;
  const imagen = product.imagenes?.[0];

  return (
    <button type="button" onClick={onSelect} className="group block text-left">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-gradient-to-br from-muted to-card">
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
        {sinStock && (
          <span className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs">
            Sin stock
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg">{product.nombre}</h3>
          {product.categoria && (
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">
              {product.categoria}
            </p>
          )}
        </div>
        <p className="flex-shrink-0 text-sm font-semibold">
          {formatoPrecio.format(product.precio)}
        </p>
      </div>
    </button>
  );
}
