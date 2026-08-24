-- Categorías de productos como entidad propia, administrable desde el admin
-- (antes solo existían como texto libre en products.categoria, sugerido por
-- un datalist derivado de lo que ya hubiera cargado). Esto permite crear una
-- categoría/mini-sección antes de tener productos en ella, y evita nombres
-- duplicados por typos ("Urbana" vs "urbana").

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  created_at  timestamptz not null default now()
);

-- siembra con las categorías que ya estén en uso, para no perder nada
insert into categories (nombre)
select distinct categoria from products
where categoria is not null and categoria <> ''
on conflict (nombre) do nothing;

alter table categories enable row level security;

-- mismo patrón que products_admin_all (0005): solo admins operan sobre esto
create policy "categories_admin_all"
  on categories for all
  using (is_admin())
  with check (is_admin());

-- Renombrar una categoría y sincronizar todos los productos que la usan,
-- en una sola transacción (evita que un fallo a mitad de camino deje
-- productos con un nombre de categoría que ya no existe).
create or replace function renombrar_categoria(p_id uuid, p_nuevo_nombre text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre_anterior text;
begin
  if not is_admin() then
    raise exception 'No autorizado';
  end if;

  select nombre into v_nombre_anterior from categories where id = p_id;
  if not found then
    raise exception 'Categoría no encontrada';
  end if;

  update categories set nombre = p_nuevo_nombre where id = p_id;

  update products set categoria = p_nuevo_nombre where categoria = v_nombre_anterior;
end;
$$;

revoke execute on function renombrar_categoria(uuid, text) from public, anon, authenticated;
grant execute on function renombrar_categoria(uuid, text) to authenticated;
