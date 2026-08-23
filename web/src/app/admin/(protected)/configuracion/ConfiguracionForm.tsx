"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { actualizarHeroImagen } from "./actions";

export default function ConfiguracionForm({
  heroImageUrlInicial,
}: {
  heroImageUrlInicial: string;
}) {
  const router = useRouter();
  const [heroImageUrl, setHeroImageUrl] = useState(heroImageUrlInicial);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  async function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError(null);
    setGuardado(false);
    setSubiendo(true);
    const supabase = createSupabaseBrowserClient();

    try {
      const path = `hero-${crypto.randomUUID()}-${archivo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(path, archivo);

      if (uploadError) throw new Error(uploadError.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(path);

      setHeroImageUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  async function handleGuardar() {
    setError(null);
    setGuardando(true);
    setGuardado(false);

    const resultado = await actualizarHeroImagen(heroImageUrl);

    if (resultado.error) {
      setError(resultado.error);
      setGuardando(false);
      return;
    }

    setGuardando(false);
    setGuardado(true);
    router.refresh();
  }

  const huboCambio = heroImageUrl !== heroImageUrlInicial;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Imagen actual
        </p>
        <div className="relative mt-3 aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-card">
          <Image src={heroImageUrl} alt="" fill sizes="320px" className="object-cover" />
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        Reemplazar imagen
        <input
          type="file"
          accept="image/*"
          onChange={handleArchivo}
          disabled={subiendo}
          className="mt-1 text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-wide file:text-primary-foreground file:transition hover:file:opacity-90 disabled:cursor-not-allowed"
        />
        {subiendo && <p className="mt-1 text-xs text-muted-foreground">Subiendo...</p>}
      </label>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {guardado && (
        <p className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
          Guardado. Ya se actualizó en la home.
        </p>
      )}

      <button
        type="button"
        onClick={handleGuardar}
        disabled={!huboCambio || subiendo || guardando}
        className="w-fit rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {guardando ? "Guardando..." : "Guardar imagen"}
      </button>
    </div>
  );
}
