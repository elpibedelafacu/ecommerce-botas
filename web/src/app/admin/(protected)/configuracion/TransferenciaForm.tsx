"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarDatosTransferencia } from "./actions";

export default function TransferenciaForm({
  aliasInicial,
  cbuInicial,
  titularInicial,
}: {
  aliasInicial: string;
  cbuInicial: string;
  titularInicial: string;
}) {
  const router = useRouter();
  const [alias, setAlias] = useState(aliasInicial);
  const [cbu, setCbu] = useState(cbuInicial);
  const [titular, setTitular] = useState(titularInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const huboCambio =
    alias !== aliasInicial || cbu !== cbuInicial || titular !== titularInicial;

  async function handleGuardar() {
    setError(null);
    setGuardando(true);
    setGuardado(false);

    const resultado = await actualizarDatosTransferencia({ alias, cbu, titular });

    if (resultado.error) {
      setError(resultado.error);
      setGuardando(false);
      return;
    }

    setGuardando(false);
    setGuardado(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        Alias
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="botas.store.mp"
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        CBU
        <input
          type="text"
          value={cbu}
          onChange={(e) => setCbu(e.target.value)}
          placeholder="0000003100000000000000"
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Titular de la cuenta
        <input
          type="text"
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
          placeholder="Nombre y apellido"
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
      </label>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {guardado && (
        <p className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
          Guardado. Ya se muestra en la confirmación del checkout.
        </p>
      )}

      <button
        type="button"
        onClick={handleGuardar}
        disabled={!huboCambio || guardando}
        className="w-fit rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {guardando ? "Guardando..." : "Guardar datos"}
      </button>
    </div>
  );
}
