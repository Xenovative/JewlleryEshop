"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart, cartCount } from "@/lib/cart";
import { useT } from "./I18nProvider";

export function CartIndicator() {
  const [count, setCount] = useState(0);
  const t = useT();

  useEffect(() => {
    const update = () => setCount(cartCount(readCart()));
    update();
    window.addEventListener("cart:changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cart:changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <Link href="/cart" className="text-sm hover:text-brand-600">
      {t("nav.cart")} ({count})
    </Link>
  );
}
