import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Product } from "@/lib/types";
import ProductoForm from "../ProductoForm";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: producto } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single<Product>();

  if (!producto) notFound();

  const { data: filas } = await supabase.from("products").select("categoria");
  const categoriasExistentes = Array.from(
    new Set((filas ?? []).map((f) => f.categoria).filter(Boolean))
  ) as string[];

  return (
    <div>
      <Link
        href="/admin/productos"
        className="text-xs uppercase tracking-[0.15em] text-muted-foreground transition hover:text-foreground"
      >
        ← Productos
      </Link>
      <h1 className="mt-3 font-serif text-2xl">{producto.nombre}</h1>
      <div className="mt-6 max-w-2xl">
        <ProductoForm initialProduct={producto} categoriasExistentes={categoriasExistentes} />
      </div>
    </div>
  );
}
