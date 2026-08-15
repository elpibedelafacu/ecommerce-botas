# Fase 1 — Base de datos y modelado

## 1. Crear el proyecto en Supabase

Esto lo tenés que hacer vos manualmente (requiere tu cuenta):

1. Entrá a https://supabase.com/dashboard y creá un nuevo proyecto.
2. Guardá la contraseña de la base y anotá la `Project URL` y la `anon key`
   (Project Settings → API) — las vas a necesitar para el frontend en Fase 2+.

## 2. CLI ya instalada

La Supabase CLI está instalada como dependencia de desarrollo del proyecto
(`npm install supabase --save-dev`) y se invoca con `npx supabase ...` o con
los scripts de `package.json`. No requiere instalación global.

Pasos para conectarla a tu proyecto (requieren tu cuenta, hacelos vos):

```bash
# 1. Login (abre el navegador para autenticarte)
npm run db:login

# 2. Vincular este repo con tu proyecto de Supabase
#    (el project-ref está en la URL del dashboard: https://supabase.com/dashboard/project/<ref>)
npm run db:link -- --project-ref <tu-project-ref>

# 3. Subir las migraciones de supabase/migrations/ a la base remota
npm run db:push
```

Scripts disponibles (ver `package.json`):
- `npm run db:login` — autenticarse con Supabase.
- `npm run db:link` — vincular el proyecto local con el remoto.
- `npm run db:push` — aplicar migraciones locales a la base remota.
- `npm run db:pull` — traer el estado remoto como migración local.
- `npm run db:diff` — generar una migración a partir de cambios hechos en el dashboard.
- `npm run db:reset` — resetear la base local (Docker) y reaplicar todas las migraciones.

Alternativa manual sin CLI: pegar y ejecutar en orden el contenido de cada
archivo de `migrations/` en el SQL Editor del dashboard.

## 3. Dar de alta el primer admin

Después de que el usuario se registre vía Supabase Auth (email/password u otro
provider), insertalo en `admin_users`:

```sql
insert into admin_users (user_id, email)
values ('<uuid-del-usuario-en-auth.users>', 'tu-email@ejemplo.com');
```

## 4. Probar `descontar_stock`

```sql
-- ejemplo: descontar 1 par de talle 39
select descontar_stock('<product-id>', '39', 1);
```

Si el stock del talle es insuficiente, la función lanza una excepción
(`Stock insuficiente...`) y no aplica ningún cambio.

## Notas de diseño

- **RLS (Row Level Security)** está habilitado en las tres tablas:
  - `products`: lectura pública solo de `activo = true`; admins tienen
    control total.
  - `orders`: cualquiera puede crear un pedido (checkout de invitado), pero
    solo admins pueden leerlos/editarlos/borrarlos.
  - `admin_users`: cada usuario solo puede ver su propia fila (para que el
    frontend sepa si mostrar el panel de admin).
- `descontar_stock` es `security definer`, por lo que puede actualizar
  `products.talles` aunque la policy de RLS no le dé `update` directo al
  usuario que hace el checkout. Es la única vía pensada para descontar stock.
- El descuento de stock se hace con `FOR UPDATE`, bloqueando la fila del
  producto durante la transacción — así dos compras simultáneas del mismo
  talle no pueden descontar más stock del que existe.
