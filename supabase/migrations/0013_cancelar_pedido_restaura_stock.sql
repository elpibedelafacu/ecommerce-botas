-- Fix: cancelar un pedido (cambiar estado a 'cancelado') no devolvía el
-- stock descontado en crear_pedido — el producto quedaba con menos stock
-- disponible para siempre aunque la venta nunca se concretó.
--
-- cancelar_pedido() hace las dos cosas atómicamente: devuelve el stock de
-- cada ítem y marca el pedido como cancelado. Es idempotente (si ya estaba
-- cancelado, no hace nada) para que reintentar/doble-click no duplique el
-- stock devuelto.
--
-- security definer (bypassa RLS, mismo mecanismo que crear_pedido), por eso
-- valida is_admin() a mano adentro — si no, cualquier usuario autenticado
-- podría cancelar pedidos ajenos y regalarse stock.

create or replace function cancelar_pedido(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado_actual text;
  v_items         jsonb;
  v_item          jsonb;
  v_talle         text;
  v_stock_actual  integer;
begin
  if not is_admin() then
    raise exception 'No autorizado';
  end if;

  select estado, items into v_estado_actual, v_items
  from orders
  where id = p_id
  for update;

  if not found then
    raise exception 'Pedido % no encontrado', p_id;
  end if;

  if v_estado_actual = 'cancelado' then
    return;
  end if;

  for v_item in select jsonb_array_elements(v_items)
  loop
    v_talle := v_item ->> 'talle';

    select (talles ->> v_talle)::integer into v_stock_actual
    from products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    -- si el producto o el talle ya no existen, no hay stock que devolver
    if v_stock_actual is not null then
      update products
      set talles = jsonb_set(
        talles,
        array[v_talle],
        to_jsonb(v_stock_actual + (v_item ->> 'cantidad')::integer)
      )
      where id = (v_item ->> 'product_id')::uuid;
    end if;
  end loop;

  update orders set estado = 'cancelado' where id = p_id;
end;
$$;

revoke execute on function cancelar_pedido(uuid) from public;
grant execute on function cancelar_pedido(uuid) to authenticated;
