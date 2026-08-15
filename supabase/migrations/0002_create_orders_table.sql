-- Fase 1: tabla de pedidos
-- cliente: { nombre, email, telefono, direccion }
-- items:   [{ product_id, talle, cantidad, precio_unit }]

create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  cliente        jsonb not null,
  items          jsonb not null,
  total          numeric(10, 2) not null check (total >= 0),
  estado         text not null default 'pendiente'
                 check (estado in ('pendiente', 'pagado', 'enviado', 'cancelado')),
  mp_payment_id  text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_orders_estado on orders (estado);
create index if not exists idx_orders_mp_payment_id on orders (mp_payment_id);
create index if not exists idx_orders_created_at on orders (created_at desc);

alter table orders enable row level security;

-- cualquiera puede crear un pedido (checkout de invitado, sin login)
create policy "orders_insert_publico"
  on orders for insert
  with check (true);

-- nadie (fuera de admins/service role) puede leer o modificar pedidos ajenos
-- las políticas de admin se agregan en 0005_rls_policies.sql
