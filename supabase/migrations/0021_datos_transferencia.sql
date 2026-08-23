-- Datos bancarios para mostrar en la confirmación del checkout cuando el
-- cliente elige transferencia. Mismo mecanismo de site_settings que la
-- imagen del Hero (lectura pública, escritura solo admin vía RLS ya
-- definida en 0020).

insert into site_settings (key, value) values
  ('transferencia_alias', null),
  ('transferencia_cbu', null),
  ('transferencia_titular', null)
on conflict (key) do nothing;
