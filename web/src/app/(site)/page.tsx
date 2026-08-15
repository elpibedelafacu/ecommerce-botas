import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import CraftSection from "@/components/CraftSection";

export const revalidate = 60;

type SearchParams = { categoria?: string; talle?: string };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { categoria, talle } = await searchParams;

  const { data: activos, error } = await supabase
    .from("products")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  const porCategoria = categoria
    ? (activos as Product[] | null)?.filter((p) => p.categoria === categoria)
    : activos;

  const products = talle
    ? porCategoria?.filter((p) => (p.talles?.[talle] ?? 0) > 0)
    : porCategoria;

  const categorias = Array.from(
    new Set((activos ?? []).map((p) => p.categoria).filter(Boolean))
  ) as string[];

  const talles = Array.from(
    new Set((activos ?? []).flatMap((p) => Object.keys(p.talles ?? {})))
  ).sort((a, b) => Number(a) - Number(b));

  return (
    <main>
      <Hero />
      <ProductGrid
        products={products as Product[] | null}
        categorias={categorias}
        talles={talles}
        categoria={categoria}
        talle={talle}
        error={!!error}
      />
      <CraftSection />
    </main>
  );
}
