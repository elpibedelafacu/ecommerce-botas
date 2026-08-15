export default function Page() {
  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <Hero />
        <ProductGrid />
        <CraftSection />
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  )
}
