-- Fase 1: descuento atómico de stock por talle.
-- Usa SELECT ... FOR UPDATE para bloquear la fila del producto mientras dura
-- la transacción, evitando que dos compras simultáneas descuenten stock que
-- ya no existe (condición de carrera con el último par disponible).

create or replace function descontar_stock(
  p_product_id uuid,
  p_talle      text,
  p_cantidad   integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock_actual integer;
begin
  if p_cantidad <= 0 then
    raise exception 'La cantidad a descontar debe ser mayor a 0';
  end if;

  -- bloquea la fila del producto hasta que termine la transacción
  select (talles ->> p_talle)::integer
  into v_stock_actual
  from products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'Producto % no encontrado', p_product_id;
  end if;

  if v_stock_actual is null then
    raise exception 'El talle % no existe para el producto %', p_talle, p_product_id;
  end if;

  if v_stock_actual < p_cantidad then
    raise exception 'Stock insuficiente para talle % (disponible: %, solicitado: %)',
      p_talle, v_stock_actual, p_cantidad;
  end if;

  update products
  set talles = jsonb_set(talles, array[p_talle], to_jsonb(v_stock_actual - p_cantidad))
  where id = p_product_id;
end;
$$;

-- permite invocarla vía RPC desde el cliente (anon/authenticated) para el flujo de checkout.
-- security definer hace que corra con permisos del dueño de la función, esquivando
-- las políticas RLS de products solo dentro de esta operación controlada.
grant execute on function descontar_stock(uuid, text, integer) to anon, authenticated;
