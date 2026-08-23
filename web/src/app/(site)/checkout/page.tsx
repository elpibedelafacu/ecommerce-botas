import { mercadoPagoDisponible } from "@/lib/mercadopago";
import { getDatosTransferencia } from "@/lib/site-settings";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage() {
  const datosTransferencia = await getDatosTransferencia();

  return (
    <CheckoutForm
      mercadoPagoDisponible={mercadoPagoDisponible()}
      datosTransferencia={datosTransferencia}
    />
  );
}
