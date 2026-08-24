export type Product = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  talles: Record<string, number>;
  imagenes: string[];
  categoria: string | null;
  activo: boolean;
  destacado: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  nombre: string;
  created_at: string;
};

export type OrderCliente = {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
};

export type OrderItem = {
  product_id: string;
  talle: string;
  cantidad: number;
  precio_unit: number;
};

export type OrderEstado = "pendiente" | "pagado" | "enviado" | "cancelado";
export type MetodoPago = "transferencia" | "mercadopago";

export type Order = {
  id: string;
  cliente: OrderCliente;
  items: OrderItem[];
  total: number;
  estado: OrderEstado;
  metodo_pago: MetodoPago;
  mp_payment_id: string | null;
  created_at: string;
};
