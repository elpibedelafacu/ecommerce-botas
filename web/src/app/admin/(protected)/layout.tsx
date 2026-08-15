import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { cerrarSesion } from "./actions";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: esAdmin } = await supabase.rpc("is_admin");

  if (!esAdmin) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-serif text-2xl">No autorizado</h1>
        <p className="text-sm text-muted-foreground">
          Tu cuenta ({user.email}) no tiene permisos de administrador.
        </p>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="text-sm font-medium underline underline-offset-4"
          >
            Cerrar sesión
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin/pedidos" className="font-serif text-lg">
              Botas Store · Admin
            </Link>
            <nav className="flex gap-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              <Link href="/admin/pedidos" className="transition hover:text-foreground">
                Pedidos
              </Link>
              <Link href="/admin/productos" className="transition hover:text-foreground">
                Productos
              </Link>
            </nav>
          </div>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="text-xs uppercase tracking-[0.15em] text-muted-foreground transition hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
