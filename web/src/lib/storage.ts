const PUBLIC_PRODUCTS_MARKER = "/object/public/products/";

export function extractProductImagePath(url: string): string | null {
  const idx = url.indexOf(PUBLIC_PRODUCTS_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + PUBLIC_PRODUCTS_MARKER.length);
}
