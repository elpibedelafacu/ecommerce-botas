-- Fase 1: políticas RLS restantes para administradores.
-- Requiere la función is_admin() creada en 0003_create_admin_users_table.sql

-- products: los admins pueden ver, crear, editar y borrar todo
create policy "products_admin_all"
  on products for all
  using (is_admin())
  with check (is_admin());

-- orders: solo admins pueden leer, actualizar (cambiar estado) o borrar
create policy "orders_admin_select"
  on orders for select
  using (is_admin());

create policy "orders_admin_update"
  on orders for update
  using (is_admin())
  with check (is_admin());

create policy "orders_admin_delete"
  on orders for delete
  using (is_admin());
