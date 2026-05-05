"use client";

export type CartItem = { productId: string; variantId?: string; qty: number };

const KEY = "cart_v1";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        i && typeof i.productId === "string" && typeof i.qty === "number"
    );
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export function addToCart(item: CartItem) {
  const items = readCart();
  const idx = items.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );
  if (idx >= 0) items[idx].qty += item.qty;
  else items.push(item);
  writeCart(items);
}

export function updateQty(productId: string, variantId: string | undefined, qty: number) {
  const items = readCart()
    .map((i) =>
      i.productId === productId && i.variantId === variantId ? { ...i, qty } : i
    )
    .filter((i) => i.qty > 0);
  writeCart(items);
}

export function removeFromCart(productId: string, variantId: string | undefined) {
  const items = readCart().filter(
    (i) => !(i.productId === productId && i.variantId === variantId)
  );
  writeCart(items);
}

export function clearCart() {
  writeCart([]);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}
