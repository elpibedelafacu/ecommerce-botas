-- Fase 1: tabla de administradores
-- Referencia a auth.users: un admin es un usuario de Supabase Auth marcado como tal.

create table if not exists admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

alter table admin_users enable row level security;

-- un usuario puede consultar si el/ella mismo es admin (útil para el frontend)
create policy "admin_users_select_self"
  on admin_users for select
  using (auth.uid() = user_id);

-- helper: true si el usuario autenticado actual es admin
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$;
