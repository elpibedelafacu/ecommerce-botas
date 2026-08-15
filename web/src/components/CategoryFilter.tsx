import Link from "next/link";
import { buildCatalogHref } from "@/lib/url";

function chipClass(activo: boolean) {
  return `rounded-full border px-3 py-1 text-sm capitalize transition ${
    activo
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border hover:border-foreground/40"
  }`;
}

export default function CategoryFilter({
  categorias,
  activa,
  talle,
}: {
  categorias: string[];
  activa?: string;
  talle?: string;
}) {
  if (categorias.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={buildCatalogHref({ talle })} className={chipClass(!activa)}>
        Todas
      </Link>
      {categorias.map((categoria) => (
        <Link
          key={categoria}
          href={buildCatalogHref({ categoria, talle })}
          className={chipClass(activa === categoria)}
        >
          {categoria}
        </Link>
      ))}
    </div>
  );
}
