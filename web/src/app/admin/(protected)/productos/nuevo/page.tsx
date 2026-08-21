import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ProductoForm from "../ProductoForm";

export default async function NuevoProductoPage() {
  const supabase = await createSupabaseServerClient();
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
      <h1 className="mt-3 font-serif text-2xl">Nuevo producto</h1>
      <div className="mt-6 max-w-2xl">
        <ProductoForm categoriasExistentes={categoriasExistentes} />
      </div>
    </div>
  );
}
