import Link from "next/link";
import ProductoForm from "../ProductoForm";

export default function NuevoProductoPage() {
  return (
    <div>
      <Link
        href="/admin/productos"
        className="text-xs uppercase tracking-[0.15em] text-muted-foreground transition hover:text-foreground"
      >
        ← Productos
      </Link>
      <h1 className="mt-3 font-serif text-2xl">Nuevo producto</h1>
      <div className="mt-6 max-w-2xl">
        <ProductoForm />
      </div>
    </div>
  );
}
