const items = [
  {
    titulo: "Cuero genuino",
    descripcion: "Materiales resistentes, pensados para el uso diario.",
  },
  {
    titulo: "Talles claros",
    descripcion:
      "Cada ficha de producto muestra el stock disponible por talle.",
  },
  {
    titulo: "Stock verificado",
    descripcion:
      "El stock se descuenta en tiempo real para evitar sorpresas en tu compra.",
  },
];

export default function CraftSection() {
  return (
    <section id="artesania" className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.titulo}>
            <h3 className="font-serif text-lg">{item.titulo}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.descripcion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
