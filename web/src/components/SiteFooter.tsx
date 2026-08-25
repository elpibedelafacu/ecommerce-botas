export default function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-base text-foreground">Shekina</p>
        <p>© {new Date().getFullYear()} Shekina. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
