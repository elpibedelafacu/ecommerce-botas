-- Fase 1: tabla de productos (botas)
-- talles es un objeto { "38": 5, "39": 3, "40": 0 } -> stock por talle

create extension if not exists "pgcrypto"; -- para gen_random_uuid()

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  precio      numeric(10, 2) not null check (precio >= 0),
  talles      jsonb not null default '{}'::jsonb,
  imagenes    text[] not null default '{}',
  categoria   text,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on column products.talles is 'Stock por talle, ej: {"38": 5, "39": 3, "40": 0}';

create index if not exists idx_products_categoria on products (categoria);
create index if not exists idx_products_activo on products (activo);

alter table products enable row level security;

-- lectura pública solo de productos activos (catálogo)
create policy "products_select_publico"
  on products for select
  using (activo = true);

-- lectura/escritura completa para admins (ver 0003 y 0005)
