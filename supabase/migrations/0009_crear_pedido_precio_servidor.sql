-- Fix de seguridad: crear_pedido (0006) calculaba el total multiplicando el
-- `precio_unit` que mandaba el cliente en p_items, a pesar de que el
-- comentario original decía lo contrario. Un cliente podía mandar cualquier
-- precio y el pedido quedaba registrado con un total fraguado (el stock sí
-- se descontaba bien, porque eso no dependía del precio).
--
-- Ahora el precio de cada ítem se busca en `products.precio` en el momento
-- de crear el pedido, y ese es el valor que se usa tanto para el total como
-- para el snapshot de `items` que queda guardado en el pedido — el cliente
-- ya no puede influir en el precio cobrado.

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

  insert into orders (cliente, items, total)
  values (p_cliente, v_items_final, v_total)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function crear_pedido(jsonb, jsonb) to anon, authenticated;
