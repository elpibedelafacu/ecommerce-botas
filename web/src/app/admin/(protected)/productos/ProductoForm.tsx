"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { extractProductImagePath } from "@/lib/storage";
import { crearProducto, actualizarProducto, eliminarProducto } from "./actions";

type TalleRow = { talla: string; stock: string };

function tallesAFilas(talles: Record<string, number>): TalleRow[] {
  const filas = Object.entries(talles).map(([talla, stock]) => ({
    talla,
    stock: String(stock),
  }));
  return filas.length > 0 ? filas : [{ talla: "", stock: "" }];
}

export default function ProductoForm({
  initialProduct,
  categoriasExistentes = [],
}: {
  initialProduct?: Product;
  categoriasExistentes?: string[];
}) {
  const router = useRouter();
  const esEdicion = !!initialProduct;

  const [nombre, setNombre] = useState(initialProduct?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(initialProduct?.descripcion ?? "");
  const [precio, setPrecio] = useState(String(initialProduct?.precio ?? ""));
  const [categoria, setCategoria] = useState(initialProduct?.categoria ?? "");
  const [activo, setActivo] = useState(initialProduct?.activo ?? true);
  const [destacado, setDestacado] = useState(initialProduct?.destacado ?? false);
  const [filasTalles, setFilasTalles] = useState<TalleRow[]>(
    tallesAFilas(initialProduct?.talles ?? {})
  );
  const [imagenes, setImagenes] = useState<string[]>(initialProduct?.imagenes ?? []);
  const [imagenesAEliminar, setImagenesAEliminar] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function actualizarFila(i: number, campo: keyof TalleRow, valor: string) {
    setFilasTalles((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f))
    );
  }

  function agregarFila() {
    setFilasTalles((prev) => [...prev, { talla: "", stock: "" }]);
  }

  function quitarFila(i: number) {
    setFilasTalles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleArchivos(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    setError(null);
    setSubiendo(true);
    const supabase = createSupabaseBrowserClient();

    try {
      for (const archivo of Array.from(archivos)) {
        const path = `${crypto.randomUUID()}-${archivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, archivo);

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(path);

        setImagenes((prev) => [...prev, publicUrl]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  async function quitarImagen(i: number) {
    const url = imagenes[i];
    setImagenes((prev) => prev.filter((_, idx) => idx !== i));

    if (initialProduct?.imagenes.includes(url)) {
      // ya está persistida en el producto: recién se borra de Storage si se
      // confirma el guardado, para no dejar una referencia rota en la base
      // si el admin abandona la edición sin guardar.
      setImagenesAEliminar((prev) => [...prev, url]);
      return;
    }

    // subida en esta misma sesión y todavía no persistida: no hay riesgo de
    // referencia rota, se puede borrar de una.
    const path = extractProductImagePath(url);
    if (!path) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.storage.from("products").remove([path]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const talles: Record<string, number> = {};
    for (const fila of filasTalles) {
      if (!fila.talla.trim()) continue;
      talles[fila.talla.trim()] = Number(fila.stock) || 0;
    }

    const precioNum = Number(precio);
    if (precioNum > 99999999.99) {
      setError("El precio es demasiado alto (máximo $99.999.999,99).");
      setEnviando(false);
      return;
    }

    const data = {
      nombre,
      descripcion: descripcion.trim() || null,
      precio: precioNum,
      categoria: categoria.trim() || null,
      activo,
      destacado,
      talles,
      imagenes,
    };

    const resultado = esEdicion
      ? await actualizarProducto(initialProduct.id, data)
      : await crearProducto(data);

    if (resultado.error) {
      setError(resultado.error);
      setEnviando(false);
      return;
    }

    if (imagenesAEliminar.length > 0) {
      const paths = imagenesAEliminar
        .map(extractProductImagePath)
        .filter((p): p is string => p !== null);
      if (paths.length > 0) {
        await createSupabaseBrowserClient().storage.from("products").remove(paths);
      }
    }

    router.push("/admin/productos");
    router.refresh();
  }

  async function handleEliminar() {
    if (!initialProduct) return;
    if (!window.confirm(`¿Eliminar "${initialProduct.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setError(null);
    setEnviando(true);
    const resultado = await eliminarProducto(initialProduct.id, [...imagenes, ...imagenesAEliminar]);

    if (resultado.error) {
      setError(resultado.error);
      setEnviando(false);
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          Nombre
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          Categoría (mini sección del catálogo)
          <input
            type="text"
            list="categorias-existentes"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Ej: Urbana, Trekking..."
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
          <datalist id="categorias-existentes">
            {categoriasExistentes.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          Precio
          <input
            type="number"
            min={0}
            max={99999999.99}
            step="0.01"
            required
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="h-4 w-4"
          />
          Activo (visible en la tienda)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            className="h-4 w-4"
          />
          Destacado (aparece en la home)
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        Descripción
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
      </label>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Talles y stock
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {filasTalles.map((fila, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Talla"
                value={fila.talla}
                onChange={(e) => actualizarFila(i, "talla", e.target.value)}
                className="w-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={fila.stock}
                onChange={(e) => actualizarFila(i, "stock", e.target.value)}
                className="w-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => quitarFila(i)}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={agregarFila}
            className="mt-1 self-start text-xs font-medium underline underline-offset-4"
          >
            + Agregar talla
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Imágenes
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {imagenes.map((url, i) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => quitarImagen(i)}
                aria-label="Quitar imagen"
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleArchivos}
          disabled={subiendo}
          className="mt-3 text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-wide file:text-primary-foreground file:transition hover:file:opacity-90 disabled:cursor-not-allowed"
        />
        {subiendo && <p className="mt-1 text-xs text-muted-foreground">Subiendo...</p>}
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando || subiendo}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear producto"}
        </button>

        {esEdicion && (
          <button
            type="button"
            onClick={handleEliminar}
            disabled={enviando}
            className="text-sm text-destructive underline underline-offset-4 disabled:opacity-60"
          >
            Eliminar producto
          </button>
        )}
      </div>
    </form>
  );
}
