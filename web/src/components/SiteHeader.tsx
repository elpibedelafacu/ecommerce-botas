"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function SiteHeader() {
  const { items, abrirCarrito } = useCart();
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <nav className="hidden gap-6 text-xs uppercase tracking-[0.15em] text-muted-foreground sm:flex">
          <a href="#catalogo" className="group relative pb-0.5 transition hover:text-foreground">
            Colección
            <span className="absolute inset-x-0 -bottom-0.5 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#artesania" className="group relative pb-0.5 transition hover:text-foreground">
            Artesanía
            <span className="absolute inset-x-0 -bottom-0.5 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
          </a>
        </nav>

        <Link
          href="/"
          className="font-serif text-xl tracking-wide sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        >
          Botas Store
        </Link>

        <button
          type="button"
          onClick={abrirCarrito}
          aria-label="Abrir carrito"
          className="relative flex items-center gap-2 rounded-md px-2 py-1.5 text-xs uppercase tracking-[0.15em] text-foreground transition hover:bg-secondary"
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
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="hidden sm:inline">Carrito</span>
          {cantidadTotal > 0 && (
            <span
              key={cantidadTotal}
              className="animate-badge-pop flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium normal-case tracking-normal text-primary-foreground"
            >
              {cantidadTotal}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
