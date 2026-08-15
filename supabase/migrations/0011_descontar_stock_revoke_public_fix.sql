-- Fix del fix: 0010 revocó el EXECUTE de descontar_stock a anon/authenticated,
-- pero Postgres otorga EXECUTE a la pseudo-rol PUBLIC por default al crear
-- cualquier función, y anon/authenticated heredan de PUBLIC. Revocar solo de
-- los roles específicos no alcanza — hay que revocar de PUBLIC directamente.
-- Confirmado con information_schema.routine_privileges que PUBLIC seguía
-- teniendo EXECUTE después de 0010.

revoke execute on function descontar_stock(uuid, text, integer) from public;

-- postgres y service_role siguen pudiendo ejecutarla (dueño / rol admin);
-- crear_pedido (security definer, dueña de las tablas) sigue funcionando
-- porque la llamada interna se evalúa contra el rol dueño de la función,
-- no contra el rol que invocó el RPC original.
