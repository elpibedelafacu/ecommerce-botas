import { createSupabaseServerClient } from "@/lib/supabase-server";
import ConfiguracionForm from "./ConfiguracionForm";

export default async function ConfiguracionPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero_image_url")
    .single();

  return (
    <div>
      <h1 className="font-serif text-2xl">Configuración</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Imagen destacada del Hero, la foto grande de la portada.
      </p>
      <div className="mt-6 max-w-md">
        <ConfiguracionForm heroImageUrlInicial={data?.value ?? ""} />
      </div>
    </div>
  );
}
