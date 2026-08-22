import { mercadoPagoDisponible } from "@/lib/mercadopago";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutPage() {
  return <CheckoutForm mercadoPagoDisponible={mercadoPagoDisponible()} />;
}
