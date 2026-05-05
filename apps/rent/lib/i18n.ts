export type Locale = "en" | "zh-Hant";
export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh-Hant", label: "繁體中文" },
];
export const LOCALE_COOKIE = "locale";

export const dict = {
  en: {
    "brand.name": "Lumière",
    "brand.tagline": "Rentals",
    "nav.browse": "Browse",
    "nav.howItWorks": "How it works",
    "nav.buyAt": "Buy at Lumière →",
    "footer.copyright": "Lumière Rentals",

    "home.hero.title": "Wear something extraordinary.",
    "home.hero.subtitle":
      "Designer pieces for the moments that matter — rent for a night, a weekend, or a week.",
    "home.available": "Available now",
    "home.empty": "No rentable items yet.",

    "price.perDay": "{price} / day",
    "price.fixedFor": "{price} for {days} days",
    "price.from": "from {price}",
    "price.dash": "—",

    "how.title": "How rentals work",
    "how.s1": "Browse",
    "how.s1.body": "pick a piece and select your dates.",
    "how.s2": "Book & pay",
    "how.s2.body":
      "checkout securely with Stripe; add a damage waiver if you’d like extra peace of mind.",
    "how.s3": "Receive",
    "how.s3.body":
      "we ship to you (or pick up in-store) ahead of your start date.",
    "how.s4": "Enjoy & return",
    "how.s4.body":
      "wear it, photograph it, then send it back in the prepaid pouch by your end date.",

    "item.material": "Material",
    "item.gemstone": "Gemstone",
    "book.title": "Book this piece",
    "book.startDate": "Start date",
    "book.endDate": "End date",
    "book.endDateAuto": "End date (auto)",
    "book.daysSummary": "{days} day(s) · {price} rental",
    "book.fulfillment": "Fulfillment",
    "book.ship": "Ship to me",
    "book.pickup": "Pick up in store",
    "book.shippingAddress": "Shipping address",
    "book.pickupSlot": "Pickup date & time",
    "book.yourName": "Your name",
    "book.email": "Email",
    "book.waiver": "Add damage waiver — {price}. Covers minor damage so we don’t have to bill you for repairs.",
    "book.rental": "Rental",
    "book.damageWaiver": "Damage waiver",
    "book.total": "Total",
    "book.cta": "Book & pay",
    "book.redirecting": "Redirecting…",
    "book.bookedDays": "{n} fully-booked day(s) in the next 120 days",
    "book.errPickDates": "Pick valid dates",
    "book.errEndBeforeStart": "End date must be on or after start date",
    "book.errOverlap": "One or more days in your range are already fully booked.",
    "book.errNameEmail": "Please enter your name and email.",
    "book.errAddress": "Shipping address is required.",
    "book.errPickup": "Please choose a pickup date and time.",
    "book.errCheckout": "Could not create booking",
    "book.priceLabel.daily": "{price} per day",
    "book.priceLabel.fixed": "{price} for {days} days",
    "book.priceLabel.tieredJoin": " · ",
    "book.priceLabel.none": "Pricing not configured",

    "success.title": "Booking confirmed!",
    "success.body":
      "Thank you. We’ll email your booking details and prepare your piece for the start date.",
    "success.cta": "Browse more",

    "cancel.title": "Checkout canceled",
    "cancel.body": "No charge was made. The dates you picked are released.",
    "cancel.cta": "Back to browse",

    "lang.switchLabel": "Language",
  },
  "zh-Hant": {
    "brand.name": "Lumière",
    "brand.tagline": "租賃",
    "nav.browse": "瀏覽",
    "nav.howItWorks": "租借流程",
    "nav.buyAt": "前往 Lumière 商城 →",
    "footer.copyright": "Lumière 租賃",

    "home.hero.title": "為重要時刻,戴上不凡。",
    "home.hero.subtitle":
      "為重要場合準備的設計師珠寶,可租一晚、一個週末或一整週。",
    "home.available": "目前可租",
    "home.empty": "目前尚無可租商品。",

    "price.perDay": "每日 {price}",
    "price.fixedFor": "{days} 天 {price}",
    "price.from": "{price} 起",
    "price.dash": "—",

    "how.title": "租賃流程",
    "how.s1": "瀏覽",
    "how.s1.body": "挑選您喜愛的珠寶,並選擇租借日期。",
    "how.s2": "預訂並付款",
    "how.s2.body": "透過 Stripe 安全結帳;可加購損壞保障,讓您更安心。",
    "how.s3": "收件",
    "how.s3.body": "我們會於開始日前寄送或您可至門市取件。",
    "how.s4": "享用並寄回",
    "how.s4.body": "盡情配戴後,於結束日前以預付信封寄回即可。",

    "item.material": "材質",
    "item.gemstone": "寶石",
    "book.title": "預訂此件商品",
    "book.startDate": "開始日期",
    "book.endDate": "結束日期",
    "book.endDateAuto": "結束日期(自動)",
    "book.daysSummary": "共 {days} 天 · 租金 {price}",
    "book.fulfillment": "取件方式",
    "book.ship": "宅配到府",
    "book.pickup": "門市取貨",
    "book.shippingAddress": "寄送地址",
    "book.pickupSlot": "取貨日期與時間",
    "book.yourName": "您的姓名",
    "book.email": "電子郵件",
    "book.waiver": "加購損壞保障 — {price}。涵蓋輕微損傷,讓您毋須為修復費用煩惱。",
    "book.rental": "租金",
    "book.damageWaiver": "損壞保障",
    "book.total": "合計",
    "book.cta": "預訂並付款",
    "book.redirecting": "前往付款…",
    "book.bookedDays": "未來 120 天內有 {n} 天已被預訂完",
    "book.errPickDates": "請選擇有效的日期",
    "book.errEndBeforeStart": "結束日期必須等於或晚於開始日期",
    "book.errOverlap": "您所選範圍中有部分日期已被預訂完。",
    "book.errNameEmail": "請輸入您的姓名與電子郵件。",
    "book.errAddress": "請輸入寄送地址。",
    "book.errPickup": "請選擇取貨日期與時間。",
    "book.errCheckout": "無法建立訂單",
    "book.priceLabel.daily": "每日 {price}",
    "book.priceLabel.fixed": "{days} 天 {price}",
    "book.priceLabel.tieredJoin": " · ",
    "book.priceLabel.none": "尚未設定價格",

    "success.title": "預訂已完成!",
    "success.body": "感謝您。我們將寄出預訂詳情,並於開始日前準備好商品。",
    "success.cta": "繼續瀏覽",

    "cancel.title": "結帳已取消",
    "cancel.body": "尚未產生任何費用,您所選的日期已釋出。",
    "cancel.cta": "返回瀏覽",

    "lang.switchLabel": "語言",
  },
} as const;

export type DictKey = keyof typeof dict.en;

export function makeT(locale: Locale) {
  return (key: DictKey, vars?: Record<string, string | number>): string => {
    const raw = dict[locale][key] ?? dict.en[key];
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] !== undefined ? String(vars[k]) : `{${k}}`
    );
  };
}

export function intlLocale(l: Locale): string {
  return l === "zh-Hant" ? "zh-Hant-TW" : "en-US";
}
