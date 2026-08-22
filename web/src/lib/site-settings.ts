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
