"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  const [enlaceInvalido, setEnlaceInvalido] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase redirige acá con el error en el hash/query cuando el enlace
    // ya fue usado o expiró (p. ej. porque el escáner de seguridad del mail
    // lo pre-abrió antes de que el usuario haga clic).
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const searchParams = new URLSearchParams(window.location.search);
    const errorDescripcion =
      hashParams.get("error_description") || searchParams.get("error_description");
    const errorCodigo = hashParams.get("error_code") || searchParams.get("error_code");

    if (errorDescripcion || errorCodigo) {
      setEnlaceInvalido(
        errorDescripcion
          ? decodeURIComponent(errorDescripcion.replace(/\+/g, " "))
          : `Error: ${errorCodigo}`
      );
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let activo = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && activo) setListo(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (activo && data.session) setListo(true);
    });

    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (activo && !data.session) {
        setEnlaceInvalido("Este enlace no es válido o ya expiró.");
      }
    }, 4000);

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("No se pudo actualizar la contraseña. Pedí un enlace nuevo desde el dashboard de Supabase.");
      setEnviando(false);
      return;
    }

    router.push("/admin/pedidos");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="font-serif text-2xl">Nueva contraseña</h1>

      {!listo && !enlaceInvalido && (
        <p className="mt-6 text-sm text-muted-foreground">Verificando enlace...</p>
      )}

      {enlaceInvalido && (
        <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <p>{enlaceInvalido}</p>
          <p className="mt-2">
            Pedí un enlace nuevo desde el dashboard de Supabase (Authentication
            → Users → Send password recovery) y abrilo apenas te llegue, en el
            mismo navegador y con un solo clic — algunos clientes de mail
            (Gmail, Outlook) pre-abren el link para escanearlo y lo invalidan
            antes de que lo uses.
          </p>
        </div>
      )}

      {listo && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            Contraseña nueva
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Confirmar contraseña
            <input
              type="password"
              required
              minLength={6}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      )}
    </main>
  );
}
