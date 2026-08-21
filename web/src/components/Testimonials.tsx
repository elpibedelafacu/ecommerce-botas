import FadeIn from "@/components/FadeIn";

// Testimonios de ejemplo (placeholder) hasta tener reseñas reales de clientes —
// mismo criterio que las fotos de stock: no hay que tocar el componente cuando
// se reemplacen, solo este array.
const testimonios = [
  {
    nombre: "Marina G.",
    ciudad: "Bariloche",
    texto:
      "Las llevé de prueba a un trekking de tres días y ni una rozadura. El cuero ya está tomando forma de mis pies.",
  },
  {
    nombre: "Julián P.",
    ciudad: "Buenos Aires",
    texto:
      "Compré las urbanas para el día a día y son otro nivel. Se nota la calidad del cuero apenas las tenés puestas.",
  },
  {
    nombre: "Rocío A.",
    ciudad: "Córdoba",
    texto:
      "El local me ayudó a elegir el talle justo por chat antes de comprar. Llegaron rápido y perfectas.",
  },
];

export default function Testimonials() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Lo que dicen
          </p>
          <h2 className="mt-3 text-balance font-serif text-3xl">
            Clientes que ya las están usando
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Botas pensadas para durar años, no temporadas.
          </p>
        </FadeIn>

        <FadeIn
          delay={100}
          className="mx-auto mt-8 flex w-fit items-center gap-4 rounded-xl border border-border bg-card px-6 py-4"
        >
          <span className="font-serif text-3xl">4.9</span>
          <div>
            <span className="text-sm text-gold" aria-hidden>
              ★★★★★
            </span>
            <p className="text-xs text-muted-foreground">
              Basado en 124 reseñas verificadas
            </p>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {testimonios.map((t, i) => (
            <FadeIn
              key={t.nombre}
              delay={200 + i * 100}
              className={`flex h-full flex-col gap-4 rounded-xl border p-6 ${
                i === 1
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-gold" aria-hidden>★★★★★</span>
              <p className="flex-1 text-sm leading-relaxed">“{t.texto}”</p>
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                    i === 1
                      ? "bg-primary-foreground/15"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                  aria-hidden
                >
                  {t.nombre.charAt(0)}
                </span>
                <div className="text-sm">
                  <p className="font-medium">{t.nombre}</p>
                  <p
                    className={
                      i === 1 ? "text-primary-foreground/70" : "text-muted-foreground"
                    }
                  >
                    {t.ciudad}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
