import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import Hero from "@/components/Hero";
import Destacados from "@/components/Destacados";
import Testimonials from "@/components/Testimonials";
import CraftSection from "@/components/CraftSection";

export const revalidate = 60;

export default async function Home() {
  const { data: destacados } = await supabase
    .from("products")
    .select("*")
    .eq("activo", true)
    .eq("destacado", true)
    .order("created_at", { ascending: false });

  return (
    <main>
      <Hero />
      <Destacados products={(destacados as Product[] | null) ?? []} />
      <Testimonials />
      <CraftSection />
    </main>
  );
}
