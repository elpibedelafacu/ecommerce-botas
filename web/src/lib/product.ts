export function stockTotal(talles: Record<string, number>) {
  return Object.values(talles ?? {}).reduce((acc, n) => acc + n, 0);
}
