-- Limpieza: 0013 solo otorgó EXECUTE a `authenticated`, pero Supabase tiene
-- default privileges que además le dan EXECUTE a `anon` a cualquier función
-- nueva en el schema public (por eso `descontar_stock`/`crear_pedido`
-- también necesitaron grants explícitos en su momento). El chequeo interno
-- `is_admin()` de cancelar_pedido ya bloquea a anon (probado: devuelve "No
-- autorizado"), así que esto no era explotable — pero no tiene sentido que
-- anon tenga el permiso igual. Se saca para quedar consistente con el
-- principio de mínimo privilegio aplicado al resto de las funciones.

revoke execute on function cancelar_pedido(uuid) from anon;
