-- Fase pago: soporte para elegir método de pago al finalizar la compra
-- (transferencia, como hasta ahora sin cobro automático, o Mercado Pago).

alter table orders add column if not exists metodo_pago text not null default 'transferencia'
  check (metodo_pago in ('transferencia', 'mercadopago'));

-- crear_pedido gana un tercer parámetro opcional; se reemplaza la función
-- 2-arg por la 3-arg (no se puede "or replace" con distinta firma).
drop function if exists crear_pedido(jsonb, jsonb);

create or replace function crear_pedido(
  p_cliente     jsonb,
  p_items       jsonb,
  p_metodo_pago text default 'transferencia'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item         jsonb;
  v_items_final  jsonb := '[]'::jsonb;
  v_product_id   uuid;
  v_talle        text;
  v_cantidad     integer;
  v_precio       numeric(10, 2);
  v_total        numeric(10, 2) := 0;
  v_id           uuid;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no puede tener 0 ítems';
  end if;

  if p_metodo_pago not in ('transferencia', 'mercadopago') then
    raise exception 'Método de pago inválido: %', p_metodo_pago;
  end if;

  for v_item in select jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_talle := v_item ->> 'talle';
    v_cantidad := (v_item ->> 'cantidad')::integer;

    select precio into v_precio from products where id = v_product_id;
    if not found then
      raise exception 'Producto % no encontrado', v_product_id;
    end if;

    perform descontar_stock(v_product_id, v_talle, v_cantidad);

    v_total := v_total + v_cantidad * v_precio;

    v_items_final := v_items_final || jsonb_build_object(
      'product_id', v_product_id,
      'talle', v_talle,
      'cantidad', v_cantidad,
      'precio_unit', v_precio
    );
  end loop;

  insert into orders (cliente, items, total, metodo_pago)
  values (p_cliente, v_items_final, v_total, p_metodo_pago)
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function crear_pedido(jsonb, jsonb, text) from public;
grant execute on function crear_pedido(jsonb, jsonb, text) to anon, authenticated;

-- Actualiza el estado de un pedido a 'pagado' con su mp_payment_id.
-- Llamada solo desde el webhook server-side (nunca expuesta con anon key:
-- se ejecuta con la service_role, que bypassea RLS igual que sin esta
-- función, pero la dejamos como punto único para loggear/validar a futuro).
create or replace function marcar_pedido_pagado(p_id uuid, p_mp_payment_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
  set estado = 'pagado', mp_payment_id = p_mp_payment_id
  where id = p_id and estado <> 'cancelado';
end;
$$;

revoke execute on function marcar_pedido_pagado(uuid, text) from public;
grant execute on function marcar_pedido_pagado(uuid, text) to service_role;
