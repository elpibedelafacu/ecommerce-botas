import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <Image
        src="https://jrlztkgegfvbudbqqkti.supabase.co/storage/v1/object/public/products/hero-background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--background)_55%,transparent),color-mix(in_oklch,var(--background)_88%,transparent)_70%,var(--background))]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Botas Store
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl text-balance font-serif text-4xl leading-tight sm:text-5xl">
          Botas de cuero, hechas para durar
        </h1>
        <p className="mx-auto mt-4 max-w-md text-balance text-sm text-muted-foreground sm:text-base">
          Diseño clásico y materiales de calidad. Elegí tu talle y sumalo al
          carrito en simples pasos.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#catalogo"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wide text-primary-foreground transition hover:opacity-90"
          >
            Ver catálogo
          </a>
          <a
            href="#artesania"
            className="rounded-md border border-border bg-background/40 px-6 py-3 text-sm font-medium uppercase tracking-wide backdrop-blur transition hover:border-foreground/40"
          >
            Nuestra artesanía
          </a>
        </div>
      </div>
    </section>
  );
}
