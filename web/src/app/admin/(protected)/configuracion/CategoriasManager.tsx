"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { crearCategoria, renombrarCategoria, eliminarCategoria } from "./actions";

function FilaCategoria({
  categoria,
  cantidadProductos,
}: {
  categoria: Category;
  cantidadProductos: number;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(categoria.nombre);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar() {
    if (nombre.trim() === categoria.nombre) {
      setEditando(false);
      return;
    }
    setError(null);
    setEnviando(true);
    const resultado = await renombrarCategoria(categoria.id, nombre);
    if (resultado.error) {
      setError(resultado.error);
      setEnviando(false);
      return;
    }
    setEnviando(false);
    setEditando(false);
    router.refresh();
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    setError(null);
    setEnviando(true);
    const resultado = await eliminarCategoria(categoria.id, categoria.nombre);
    if (resultado.error) {
      setError(resultado.error);
      setEnviando(false);
      return;
    }
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center gap-3 py-4">
      {editando ? (
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
          className="w-48 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
        />
      ) : (
        <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize">
          {categoria.nombre}
        </span>
      )}

      <span className="text-xs text-muted-foreground">
        {cantidadProductos} producto{cantidadProductos === 1 ? "" : "s"}
      </span>

      <div className="flex items-center gap-3">
        {editando ? (
          <>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={enviando}
              className="text-xs font-medium text-primary underline underline-offset-4 disabled:opacity-60"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setNombre(categoria.nombre);
                setEditando(false);
                setError(null);
              }}
              disabled={enviando}
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Renombrar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              disabled={enviando}
              className="text-xs text-destructive underline underline-offset-4 disabled:opacity-60"
            >
              Eliminar
            </button>
          </>
        )}
      </div>

      {error && <p className="w-full text-xs text-destructive">{error}</p>}
    </li>
  );
}

export default function CategoriasManager({
  categorias,
  conteos,
}: {
  categorias: Category[];
  conteos: Record<string, number>;
}) {
  const router = useRouter();
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const resultado = await crearCategoria(nombreNuevo);
    if (resultado.error) {
      setError(resultado.error);
      setEnviando(false);
      return;
    }
    setNombreNuevo("");
    setEnviando(false);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleCrear} className="flex flex-wrap items-start gap-3">
        <input
          type="text"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          placeholder="Ej: Casual, Botín..."
          className="w-64 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={enviando || !nombreNuevo.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Agregando..." : "Agregar categoría"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {categorias.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Todavía no hay categorías.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {categorias.map((categoria) => (
            <FilaCategoria
              key={categoria.id}
              categoria={categoria}
              cantidadProductos={conteos[categoria.nombre] ?? 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
