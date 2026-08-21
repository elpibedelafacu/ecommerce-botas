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
  const [productoAnterior, setProductoAnterior] = useState(product);
  // seguimos mostrando el último producto mientras el modal se desvanece,
  // así el contenido no desaparece de golpe antes de que termine la salida
  const [mostrado, setMostrado] = useState(product);

  const abierto = product !== null;

  if (product !== productoAnterior) {
    setProductoAnterior(product);
    setTalle(null);
    if (product) setMostrado(product);
  }

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

  if (!mostrado) return null;

  const tallesDisponibles = Object.entries(mostrado.talles ?? {})
    .filter(([, stock]) => stock > 0)
    .map(([t]) => t)
    .sort((a, b) => Number(a) - Number(b));

  const stockTalle = talle ? mostrado.talles[talle] ?? 0 : 0;
  const sinStock = tallesDisponibles.length === 0;

  function handleAdd() {
    if (!talle) return;
    agregarItem({
      productId: mostrado!.id,
      nombre: mostrado!.nombre,
      imagen: mostrado!.imagenes?.[0] ?? null,
      talle,
      cantidad: 1,
      precioUnit: mostrado!.precio,
    });
    onClose();
  }

  return (
    <div
      aria-hidden={!abierto}
      className={`fixed inset-0 z-50 ${abierto ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          abierto ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-label={mostrado.nombre}
          className={`pointer-events-auto grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-y-auto rounded-lg bg-card text-card-foreground shadow-2xl transition-all duration-300 ease-out sm:grid-cols-2 sm:overflow-visible ${
            abierto ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <div className="relative sm:h-full">
            <ProductGallery imagenes={mostrado.imagenes} nombre={mostrado.nombre} />
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

            {mostrado.categoria && (
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {mostrado.categoria}
              </p>
            )}
            <h2 className="mt-2 font-serif text-3xl">{mostrado.nombre}</h2>
            <p className="mt-3 text-lg font-semibold text-gold">
              {formatoPrecio.format(mostrado.precio)}
            </p>

            {mostrado.descripcion && (
              <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                {mostrado.descripcion}
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
