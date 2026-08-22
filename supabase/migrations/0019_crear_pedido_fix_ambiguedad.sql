-- Fix: RETURNS TABLE(id uuid, total numeric) crea un parámetro OUT implícito
-- llamado "id" visible en todo el cuerpo de la función, que choca con la
-- columna products.id en el "where id = v_product_id" de más abajo
-- ("column reference \"id\" is ambiguous"). Se soluciona calificando la
-- columna con el nombre de la tabla.

create or replace function crear_pedido(
  p_cliente     jsonb,
  p_items       jsonb,
  p_metodo_pago text default 'transferencia'
)
returns table(id uuid, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item          jsonb;
  v_items_final   jsonb := '[]'::jsonb;
  v_product_id    uuid;
  v_talle         text;
  v_cantidad      integer;
  v_precio        numeric(10, 2);
  v_precio_final  numeric(10, 2);
  v_descuento     numeric := 0;
  v_total         numeric(10, 2) := 0;
  v_id            uuid;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no puede tener 0 ítems';
  end if;

  if p_metodo_pago not in ('transferencia', 'mercadopago') then
    raise exception 'Método de pago inválido: %', p_metodo_pago;
  end if;

  if p_metodo_pago = 'transferencia' then
    v_descuento := 0.05;
  end if;

  for v_item in select jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_talle := v_item ->> 'talle';
    v_cantidad := (v_item ->> 'cantidad')::integer;

    select products.precio into v_precio from products where products.id = v_product_id;
    if not found then
      raise exception 'Producto % no encontrado', v_product_id;
    end if;

    perform descontar_stock(v_product_id, v_talle, v_cantidad);

    v_precio_final := round(v_precio * (1 - v_descuento), 2);
    v_total := v_total + v_cantidad * v_precio_final;

    v_items_final := v_items_final || jsonb_build_object(
      'product_id', v_product_id,
      'talle', v_talle,
      'cantidad', v_cantidad,
      'precio_unit', v_precio_final
    );
  end loop;

  insert into orders (cliente, items, total, metodo_pago)
  values (p_cliente, v_items_final, v_total, p_metodo_pago)
  returning orders.id into v_id;

  return query select v_id, v_total;
end;
$$;
