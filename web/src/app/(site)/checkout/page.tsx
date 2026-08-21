"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabase";

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

type Cliente = {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
};

const clienteVacio: Cliente = { nombre: "", email: "", telefono: "", direccion: "" };

export default function CheckoutPage() {
  const { items, total, vaciarCarrito } = useCart();
  const [cliente, setCliente] = useState<Cliente>(clienteVacio);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const itemsPedido = items.map((i) => ({
      product_id: i.productId,
      talle: i.talle,
      cantidad: i.cantidad,
    }));

    const { data, error: rpcError } = await supabase.rpc("crear_pedido", {
      p_cliente: cliente,
      p_items: itemsPedido,
    });

    if (rpcError) {
      setError(rpcError.message);
      setEnviando(false);
      return;
    }

    setPedidoId(data as string);
    vaciarCarrito();
    setEnviando(false);
  }

  if (pedidoId) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">¡Gracias por tu compra!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tu pedido fue registrado. Te vamos a contactar a{" "}
          <span className="text-foreground">{cliente.email}</span> para coordinar el pago y el
          envío.
        </p>
        <p className="mt-6 rounded-md border border-border px-4 py-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Pedido #{pedidoId.slice(0, 8)}
        </p>
        <Link
          href="/coleccion"
          className="mt-8 text-sm font-medium underline underline-offset-4"
        >
          Volver al catálogo
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">Tu carrito está vacío</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Agregá productos al carrito antes de finalizar la compra.
        </p>
        <Link href="/coleccion" className="mt-8 text-sm font-medium underline underline-offset-4">
          Ver catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-3xl gap-10 px-4 py-16 sm:grid-cols-2">
      <div>
        <h1 className="font-serif text-3xl">Finalizar compra</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            Nombre y apellido
            <input
              type="text"
              required
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Email
            <input
              type="email"
              required
              value={cliente.email}
              onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Teléfono
            <input
              type="tel"
              required
              value={cliente.telefono}
              onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Dirección de envío
            <input
              type="text"
              required
              value={cliente.direccion}
              onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
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
            {enviando ? "Confirmando..." : "Confirmar pedido"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-serif text-xl">Tu pedido</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.talle}`}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p>{item.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  Talle {item.talle} · x{item.cantidad}
                </p>
              </div>
              <span className="font-medium text-gold">
                {formatoPrecio.format(item.precioUnit * item.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium">Total</span>
          <span className="text-lg font-semibold text-gold">{formatoPrecio.format(total)}</span>
        </div>
      </div>
    </main>
  );
}
