-- Fase 4: creación atómica de pedidos (checkout sin pago).
-- Envuelve el descuento de stock (0004) y la inserción del pedido en una sola
-- transacción: si falta stock para cualquier ítem, todo se revierte y no
-- queda ni pedido huérfano ni descuento parcial.
--
-- p_items: [{ "product_id": uuid, "talle": text, "cantidad": int, "precio_unit": numeric }]
-- El total se calcula server-side a partir de p_items, no se confía en un
-- total mandado por el cliente.

create or replace function crear_pedido(
  p_cliente jsonb,
  p_items   jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item   jsonb;
  v_total  numeric(10, 2) := 0;
  v_id     uuid;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no puede tener 0 ítems';
  end if;

  for v_item in select jsonb_array_elements(p_items)
  loop
    perform descontar_stock(
      (v_item ->> 'product_id')::uuid,
      v_item ->> 'talle',
      (v_item ->> 'cantidad')::integer
    );

    v_total := v_total + (v_item ->> 'cantidad')::integer * (v_item ->> 'precio_unit')::numeric;
  end loop;

  insert into orders (cliente, items, total)
  values (p_cliente, p_items, v_total)
  returning id into v_id;

  return v_id;
end;
$$;

-- permite invocarla vía RPC desde el cliente (anon/authenticated) para el flujo de checkout.
grant execute on function crear_pedido(jsonb, jsonb) to anon, authenticated;
