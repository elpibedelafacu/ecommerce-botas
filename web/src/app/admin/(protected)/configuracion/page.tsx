import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Category, Product } from "@/lib/types";
import ConfiguracionForm from "./ConfiguracionForm";
import DestacadosManager from "./DestacadosManager";
import TransferenciaForm from "./TransferenciaForm";
import CategoriasManager from "./CategoriasManager";

export default async function ConfiguracionPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { data: heroSetting },
    { data: productos },
    { data: transferenciaSettings },
    { data: categorias },
  ] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "hero_image_url").single(),
    supabase.from("products").select("*").order("nombre"),
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["transferencia_alias", "transferencia_cbu", "transferencia_titular"]),
    supabase.from("categories").select("*").order("nombre"),
  ]);

  const transferenciaPorClave = new Map(
    (transferenciaSettings ?? []).map((fila) => [fila.key, fila.value])
  );

  const conteosPorCategoria: Record<string, number> = {};
  for (const producto of (productos as Product[] | null) ?? []) {
    if (!producto.categoria) continue;
    conteosPorCategoria[producto.categoria] = (conteosPorCategoria[producto.categoria] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="font-serif text-2xl">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Imagen destacada del Hero, la foto grande de la portada.
        </p>
        <div className="mt-6 max-w-md">
          <ConfiguracionForm heroImageUrlInicial={heroSetting?.value ?? ""} />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl">Categorías</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Las mini-secciones que agrupan el catálogo en /coleccion. Creá una acá
          antes de asignarla a un producto, o renombrá/eliminá las que ya existen.
        </p>
        <div className="mt-6">
          <CategoriasManager
            categorias={(categorias as Category[]) ?? []}
            conteos={conteosPorCategoria}
          />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl">Datos de transferencia</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Se muestran al cliente en la confirmación del checkout cuando elige pagar
          por transferencia.
        </p>
        <div className="mt-6 max-w-md">
          <TransferenciaForm
            aliasInicial={transferenciaPorClave.get("transferencia_alias") ?? ""}
            cbuInicial={transferenciaPorClave.get("transferencia_cbu") ?? ""}
            titularInicial={transferenciaPorClave.get("transferencia_titular") ?? ""}
          />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl">Productos destacados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elegí qué productos aparecen en la sección &quot;Destacados&quot; de la
          home, y ajustá su precio ahí mismo si hace falta.
        </p>
        <div className="mt-6">
          <DestacadosManager productos={(productos as Product[]) ?? []} />
        </div>
      </div>
    </div>
  );
}
