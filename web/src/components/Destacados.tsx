"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ProductQuickView from "@/components/ProductQuickView";
import FadeIn from "@/components/FadeIn";

export default function Destacados({ products }: { products: Product[] }) {
  const [seleccionado, setSeleccionado] = useState<Product | null>(null);

  if (products.length === 0) return null;

  return (
    <section id="destacados" className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Selección
          </p>
          <h2 className="mt-2 font-serif text-2xl">Destacados</h2>
        </div>
        <Link
          href="/coleccion"
          className="text-sm font-medium underline underline-offset-4 transition hover:text-primary"
        >
          Ver colección completa →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => (
          <FadeIn key={product.id} delay={(i % 3) * 80}>
            <ProductCard product={product} onSelect={() => setSeleccionado(product)} />
          </FadeIn>
        ))}
      </div>

      <ProductQuickView product={seleccionado} onClose={() => setSeleccionado(null)} />
    </section>
  );
}
