"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ProductQuickView from "@/components/ProductQuickView";
import CategoryFilter from "@/components/CategoryFilter";
import TalleFilter from "@/components/TalleFilter";

export default function ProductGrid({
  products,
  categorias,
  talles,
  categoria,
  talle,
  error,
}: {
  products: Product[] | null;
  categorias: string[];
  talles: string[];
  categoria?: string;
  talle?: string;
  error: boolean;
}) {
  const [seleccionado, setSeleccionado] = useState<Product | null>(null);

  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="font-serif text-2xl">Catálogo</h2>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CategoryFilter categorias={categorias} activa={categoria} talle={talle} />
        <TalleFilter talles={talles} activo={talle} categoria={categoria} />
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive">
          No se pudo cargar el catálogo. Intentá de nuevo más tarde.
        </p>
      )}

      {!error && products?.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No hay productos que coincidan con el filtro.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={() => setSeleccionado(product)}
          />
        ))}
      </div>

      <ProductQuickView product={seleccionado} onClose={() => setSeleccionado(null)} />
    </section>
  );
}
