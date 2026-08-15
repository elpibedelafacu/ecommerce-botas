"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  nombre: string;
  imagen: string | null;
  talle: string;
  cantidad: number;
  precioUnit: number;
};

type CartContextValue = {
  items: CartItem[];
  agregarItem: (item: CartItem) => void;
  quitarItem: (productId: string, talle: string) => void;
  actualizarCantidad: (productId: string, talle: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  total: number;
  abierto: boolean;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
};

const CART_KEY = "cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hidratado, setHidratado] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage corrupto o inaccesible: arrancamos con carrito vacío
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hidratado]);

  function agregarItem(item: CartItem) {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.talle === item.talle
      );
      if (idx === -1) return [...prev, item];
      const copia = [...prev];
      copia[idx] = { ...copia[idx], cantidad: copia[idx].cantidad + item.cantidad };
      return copia;
    });
    setAbierto(true);
  }

  function quitarItem(productId: string, talle: string) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.talle === talle))
    );
  }

  function actualizarCantidad(productId: string, talle: string, cantidad: number) {
    const cantidadClamp = Number.isFinite(cantidad) ? Math.max(1, Math.round(cantidad)) : 1;
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.talle === talle
          ? { ...i, cantidad: cantidadClamp }
          : i
      )
    );
  }

  function vaciarCarrito() {
    setItems([]);
  }

  function abrirCarrito() {
    setAbierto(true);
  }

  function cerrarCarrito() {
    setAbierto(false);
  }

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.precioUnit * i.cantidad, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      agregarItem,
      quitarItem,
      actualizarCantidad,
      vaciarCarrito,
      total,
      abierto,
      abrirCarrito,
      cerrarCarrito,
    }),
    [items, total, abierto]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
