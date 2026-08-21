-- Producto destacado: controla qué se muestra en la home (el resto vive en /coleccion)
alter table products add column if not exists destacado boolean not null default false;

create index if not exists idx_products_destacado on products (destacado);
