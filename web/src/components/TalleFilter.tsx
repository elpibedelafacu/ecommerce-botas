import Link from "next/link";
import { buildCatalogHref } from "@/lib/url";

function chipClass(activo: boolean) {
  return `rounded-full border px-3 py-1 text-sm transition ${
    activo
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border hover:border-foreground/40"
  }`;
}

export default function TalleFilter({
  talles,
  activo,
  categoria,
}: {
  talles: string[];
  activo?: string;
  categoria?: string;
}) {
  if (talles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={buildCatalogHref({ categoria })} className={chipClass(!activo)}>
        Todos los talles
      </Link>
      {talles.map((talle) => (
        <Link
          key={talle}
          href={buildCatalogHref({ categoria, talle })}
          className={chipClass(activo === talle)}
        >
          {talle}
        </Link>
      ))}
    </div>
  );
}
