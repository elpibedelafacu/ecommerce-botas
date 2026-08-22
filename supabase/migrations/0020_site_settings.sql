-- Configuración general del sitio (clave/valor), para cosas como la imagen
-- del Hero que hasta ahora estaba hardcodeada en el código y solo se podía
-- cambiar editando el componente.

create table if not exists site_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

insert into site_settings (key, value)
values (
  'hero_image_url',
  'https://jrlztkgegfvbudbqqkti.supabase.co/storage/v1/object/public/products/hero-background.jpg'
)
on conflict (key) do nothing;

alter table site_settings enable row level security;

-- lectura pública: el Hero de la home necesita leer esto sin sesión
create policy "site_settings_select_publico"
  on site_settings for select
  using (true);

-- solo admins pueden modificarlo
create policy "site_settings_admin_all"
  on site_settings for all
  using (is_admin())
  with check (is_admin());
