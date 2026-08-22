import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { getHeroImageUrl } from "@/lib/site-settings";

export default async function Hero() {
  const heroImageUrl = await getHeroImageUrl();

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-[0.15em] text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Cuero genuino · Hecho para durar
          </span>

          <h1 className="mt-5 text-balance font-serif text-4xl leading-tight sm:text-5xl">
            Botas de cuero, hechas para durar
          </h1>
          <p className="mt-4 max-w-md text-balance text-sm text-muted-foreground sm:text-base">
            Diseño clásico y materiales de calidad. Elegí tu talle y sumalo al
            carrito en simples pasos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/coleccion"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wide text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Ver catálogo
            </Link>
            <a
              href="#artesania"
              className="rounded-md border-2 border-primary px-6 py-3 text-sm font-medium uppercase tracking-wide text-primary transition hover:-translate-y-0.5 hover:bg-secondary"
            >
              Nuestra artesanía
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={150} className="relative mb-12 sm:mb-8">
          <Link
            href="/coleccion"
            aria-label="Ver catálogo"
            className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
          >
            <Image
              src={heroImageUrl}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="absolute -bottom-6 left-6 flex items-center gap-3 rounded-xl border-2 border-gold bg-card px-4 py-3 shadow-lg sm:left-8">
            <span className="font-serif text-2xl leading-none">4.9</span>
            <div>
              <span className="text-xs text-gold" aria-hidden>
                ★★★★★
              </span>
              <p className="text-xs text-muted-foreground">
                Valoración de clientes
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
