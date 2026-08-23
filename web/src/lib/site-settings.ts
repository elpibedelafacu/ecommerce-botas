import { supabase } from "@/lib/supabase";

const HERO_IMAGE_FALLBACK =
  "https://jrlztkgegfvbudbqqkti.supabase.co/storage/v1/object/public/products/hero-background.jpg";

export async function getHeroImageUrl() {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero_image_url")
    .single();

  return data?.value ?? HERO_IMAGE_FALLBACK;
}

export type DatosTransferencia = {
  alias: string | null;
  cbu: string | null;
  titular: string | null;
};

export async function getDatosTransferencia(): Promise<DatosTransferencia> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["transferencia_alias", "transferencia_cbu", "transferencia_titular"]);

  const porClave = new Map((data ?? []).map((fila) => [fila.key, fila.value]));

  return {
    alias: porClave.get("transferencia_alias") ?? null,
    cbu: porClave.get("transferencia_cbu") ?? null,
    titular: porClave.get("transferencia_titular") ?? null,
  };
}
