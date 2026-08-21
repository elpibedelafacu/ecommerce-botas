"use client";

import { useRef } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import FadeIn from "@/components/FadeIn";

export default function CategoryCarousel({
  titulo,
  products,
  onSelect,
}: {
  titulo: string;
  products: Product[];
  onSelect: (product: Product) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function desplazar(direccion: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <FadeIn className="mt-10 first:mt-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-serif text-xl capitalize">{titulo}</h3>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => desplazar(-1)}
            aria-label={`Ver ${titulo} anteriores`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition hover:border-primary hover:text-primary"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => desplazar(1)}
            aria-label={`Ver más ${titulo}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition hover:border-primary hover:text-primary"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-48 flex-shrink-0 snap-start sm:w-56 lg:w-64"
          >
            <ProductCard product={product} onSelect={() => onSelect(product)} />
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
