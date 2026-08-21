import { CartProvider } from "@/lib/cart-context";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartDrawer from "@/components/CartDrawer";
import RecoveryRedirect from "@/components/RecoveryRedirect";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-full flex-col">
        <RecoveryRedirect />
        <SiteHeader />
        {children}
        <SiteFooter />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
