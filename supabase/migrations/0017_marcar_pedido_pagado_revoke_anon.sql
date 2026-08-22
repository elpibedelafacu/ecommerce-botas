-- Fix de seguridad: igual que con crear_pedido/cancelar_pedido en su momento,
-- Supabase otorga EXECUTE a anon/authenticated por default en toda función
-- nueva del schema public, aparte del revoke a PUBLIC ya hecho en 0016.
-- Sin esto, cualquiera con la anon key podía marcar cualquier pedido como
-- pagado llamando marcar_pedido_pagado directo por REST, sin pasar por
-- Mercado Pago ni por el webhook.

revoke execute on function marcar_pedido_pagado(uuid, text) from anon, authenticated;
