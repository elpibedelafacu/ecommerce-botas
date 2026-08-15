-- Fix de seguridad: descontar_stock (0004) estaba otorgada directo a
-- anon/authenticated, así que cualquiera podía llamarla por RPC repetidas
-- veces para vaciar el stock de cualquier producto sin crear ningún pedido.
-- La única llamadora legítima es crear_pedido(), que corre `security
-- definer` como dueña de las tablas y no necesita el grant público para
-- invocarla internamente (el chequeo de privilegios de esa llamada interna
-- se hace contra el rol dueño de la función, no contra el rol original que
-- invocó el RPC).

revoke execute on function descontar_stock(uuid, text, integer) from anon, authenticated;
