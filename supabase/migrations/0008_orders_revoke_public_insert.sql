-- Fix de seguridad: la policy "orders_insert_publico" (0002) permitía
-- insertar filas en `orders` directo por la REST API de Supabase, sin pasar
-- por `crear_pedido()` — es decir, sin descontar stock y con cualquier
-- `total`/`items` inventado por el cliente.
--
-- El checkout real nunca insertó directo en `orders` (usa el RPC
-- `crear_pedido`), y esa función corre `security definer` como dueña de la
-- tabla, así que sigue pudiendo insertar sin ninguna policy de insert
-- pública — confirmado porque `descontar_stock` (mismo mecanismo) ya
-- actualiza `products` a pesar de que `products_admin_all` exige is_admin().

drop policy if exists "orders_insert_publico" on orders;
