"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import ProductQuickView from "@/components/ProductQuickView";
import CategoryFilter from "@/components/CategoryFilter";
import TalleFilter from "@/components/TalleFilter";
import CategoryCarousel from "@/components/CategoryCarousel";

const SIN_CATEGORIA = "Otros";

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

  const porCategoria = new Map<string, Product[]>();
  for (const product of products ?? []) {
    const key = product.categoria ?? SIN_CATEGORIA;
    if (!porCategoria.has(key)) porCategoria.set(key, []);
    porCategoria.get(key)!.push(product);
  }

  const secciones = categorias.filter((c) => porCategoria.has(c));
  if (porCategoria.has(SIN_CATEGORIA)) secciones.push(SIN_CATEGORIA);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-serif text-3xl">Colección</h1>

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

      {secciones.map((titulo) => (
        <CategoryCarousel
          key={titulo}
          titulo={titulo}
          products={porCategoria.get(titulo)!}
          onSelect={setSeleccionado}
        />
      ))}

      <ProductQuickView product={seleccionado} onClose={() => setSeleccionado(null)} />
    </section>
  );
}
