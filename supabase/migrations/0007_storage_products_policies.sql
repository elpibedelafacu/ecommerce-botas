-- Fase 6: permite a los admins subir y borrar imágenes en el bucket público
-- "products" (creado manualmente en Storage) desde el CRUD de productos.
-- La lectura pública del bucket ya está habilitada por su configuración
-- "public"; acá solo se agregan las policies de escritura.

create policy "products_bucket_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());

create policy "products_bucket_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());
