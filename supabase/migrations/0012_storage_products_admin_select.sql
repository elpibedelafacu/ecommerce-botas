-- Fix: el endpoint de borrado en lote de Supabase Storage (usado por
-- supabase-js `.remove()`) devolvía éxito con un array vacío en vez de
-- borrar el archivo, incluso con la policy de DELETE ya otorgada a admins.
-- Causa: no existía ninguna policy de SELECT sobre storage.objects para el
-- rol authenticated en el bucket "products" — el flag "public" del bucket
-- solo habilita la lectura pública vía el endpoint de descarga (CDN), no el
-- acceso a la tabla storage.objects en sí. Sin poder "ver" la fila, el
-- borrado en lote no encuentra nada para borrar (mismo patrón que RETURNING
-- filtrado por RLS visto en `orders`, ver 0008/0009).

create policy "products_bucket_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'products' and public.is_admin());
