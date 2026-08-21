"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function CartDrawer() {
  const { items, quitarItem, actualizarCantidad, total, abierto, cerrarCarrito } =
    useCart();

  useEffect(() => {
    if (!abierto) return;

    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") cerrarCarrito();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto, cerrarCarrito]);

  return (
    <div
      aria-hidden={!abierto}
      className={`fixed inset-0 z-50 ${abierto ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={cerrarCarrito}
        className={`absolute inset-0 bg-black/60 transition-opacity ${
          abierto ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label="Carrito de compras"
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-card text-card-foreground shadow-xl transition-transform duration-300 ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-lg">Tu carrito</h2>
          <button
            type="button"
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
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
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <p className="text-sm text-muted-foreground">
              Todavía no agregaste productos.
            </p>
            <Link
              href="/coleccion"
              onClick={cerrarCarrito}
              className="text-sm font-medium underline underline-offset-4"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-border px-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.talle}`}
                  className="animate-item-in flex items-center gap-3 py-4"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-muted to-card">
                    {item.imagen ? (
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.nombre}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Talle {item.talle}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gold">
                      {formatoPrecio.format(item.precioUnit)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={item.cantidad}
                      onChange={(e) =>
                        actualizarCantidad(
                          item.productId,
                          item.talle,
                          Number(e.target.value)
                        )
                      }
                      aria-label={`Cantidad de ${item.nombre} talle ${item.talle}`}
                      className="w-14 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => quitarItem(item.productId, item.talle)}
                      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-semibold text-gold">
                  {formatoPrecio.format(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={cerrarCarrito}
                className="mt-4 block w-full rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
              >
                Finalizar compra
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
