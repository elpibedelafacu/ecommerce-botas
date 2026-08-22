"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { actualizarDestacado } from "./actions";

function Fila({ producto }: { producto: Product }) {
  const router = useRouter();
  const [destacado, setDestacado] = useState(producto.destacado);
  const [precio, setPrecio] = useState(String(producto.precio));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const huboCambio =
    destacado !== producto.destacado || Number(precio) !== producto.precio;

  async function handleGuardar() {
    setError(null);
    setGuardando(true);

    const resultado = await actualizarDestacado(producto.id, {
      destacado,
      precio: Number(precio),
    });

    if (resultado.error) {
      setError(resultado.error);
      setGuardando(false);
      return;
    }

    setGuardando(false);
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-muted to-card">
        {producto.imagenes?.[0] ? (
          <Image
            src={producto.imagenes[0]}
            alt={producto.nombre}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{producto.nombre}</p>
        {!producto.activo && (
          <p className="mt-0.5 text-xs text-destructive">
            Inactivo — no se muestra aunque esté destacado
          </p>
        )}
      </div>

      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input
          type="number"
          min={0}
          max={99999999.99}
          step="0.01"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="w-28 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm text-foreground"
        />
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={destacado}
          onChange={(e) => setDestacado(e.target.checked)}
          className="h-4 w-4"
        />
        Destacado
      </label>

      <button
        type="button"
        onClick={handleGuardar}
        disabled={!huboCambio || guardando}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {guardando ? "..." : "Guardar"}
      </button>

      {error && <p className="w-full text-xs text-destructive">{error}</p>}
    </li>
  );
}

export default function DestacadosManager({ productos }: { productos: Product[] }) {
  if (productos.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay productos cargados.</p>;
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {productos.map((producto) => (
        <Fila key={producto.id} producto={producto} />
      ))}
    </ul>
  );
}
