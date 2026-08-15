"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import ProductGallery from "@/components/ProductGallery";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function ProductQuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { agregarItem } = useCart();
  const [talle, setTalle] = useState<string | null>(null);

  const abierto = product !== null;

  useEffect(() => {
    setTalle(null);
  }, [product]);

  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto, onClose]);

  if (!product) return null;

  const tallesDisponibles = Object.entries(product.talles ?? {})
    .filter(([, stock]) => stock > 0)
    .map(([t]) => t)
    .sort((a, b) => Number(a) - Number(b));

  const stockTalle = talle ? product.talles[talle] ?? 0 : 0;
  const sinStock = tallesDisponibles.length === 0;

  function handleAdd() {
    if (!talle) return;
    agregarItem({
      productId: product!.id,
      nombre: product!.nombre,
      imagen: product!.imagenes?.[0] ?? null,
      talle,
      cantidad: 1,
      precioUnit: product!.precio,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="absolute inset-0 bg-black/70" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-label={product.nombre}
          className="pointer-events-auto grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-y-auto rounded-lg bg-card text-card-foreground shadow-2xl sm:grid-cols-2 sm:overflow-visible"
        >
          <div className="relative sm:h-full">
            <ProductGallery imagenes={product.imagenes} nombre={product.nombre} />
          </div>

          <div className="relative flex flex-col p-6 sm:overflow-y-auto">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {product.categoria && (
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {product.categoria}
              </p>
            )}
            <h2 className="mt-2 font-serif text-3xl">{product.nombre}</h2>
            <p className="mt-3 text-lg font-semibold">
              {formatoPrecio.format(product.precio)}
            </p>

            {product.descripcion && (
              <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                {product.descripcion}
              </p>
            )}

            {sinStock ? (
              <p className="mt-6 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
                Sin stock disponible por el momento.
              </p>
            ) : (
              <>
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    Selecciona tu talla
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tallesDisponibles.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTalle(t)}
                        className={`flex h-11 w-11 items-center justify-center rounded-md border text-sm transition ${
                          talle === t
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-foreground/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {talle && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {stockTalle} disponibles
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!talle}
                  className="mt-6 w-full rounded-md px-4 py-3 text-sm font-medium uppercase tracking-wide transition disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground bg-primary text-primary-foreground enabled:hover:opacity-90"
                >
                  {talle ? "Agregar al carrito" : "Elegí una talla"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
