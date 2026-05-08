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
    "nav.admin": "Admin",
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
    "how.s3.body": "pick up at our Hong Kong office ahead of your start date.",
    "how.s4": "Enjoy & return",
    "how.s4.body":
      "wear it, photograph it, then send it back in the prepaid pouch by your end date.",

    "item.material": "Material",
    "item.gemstone": "Gemstone",
    "book.title": "Book this piece",
    "book.startDate": "Rental start date",
    "book.endDate": "End date",
    "book.endDateAuto": "End date (auto)",
    "book.daysSummary": "{days} day(s) · {price} rental",
    "book.planHint": "4-day plan: {pct4}% of retail · 7-day plan: {pct7}% (HKD)",
    "book.pickupOnly":
      "Rentals are collected and returned in person at our Hong Kong office only — we do not ship rental items.",
    "book.rentalPlan": "Rental length",
    "book.plan4": "4 days",
    "book.plan7": "7 days",
    "book.periodSummary":
      "{start} to {end} ({days} days) · {pct}% of retail reference price · {price}",
    "book.fobTerms": "FOB - Hong Kong Office",
    "book.fulfillment": "Fulfillment",
    "book.ship": "Ship to me",
    "book.pickup": "Pick up in store",
    "book.shippingAddress": "Shipping address",
    "book.pickupSlot": "Office pickup date & time",
    "book.yourName": "Your name",
    "book.email": "Email",
    "book.waiver": "Add damage waiver — {price}. Covers minor damage so we don’t have to bill you for repairs.",
    "book.rental": "Rental",
    "book.damageWaiver": "Damage waiver",
    "book.total": "Total",
    "book.cta": "Book & pay",
    "book.ctaReview": "Continue to checkout",
    "book.redirecting": "Saving…",
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
      "Thank you. We’ll email your booking details. Please collect your piece at our Hong Kong office as arranged.",
    "success.cta": "Browse more",

    "review.title": "Review your booking",
    "review.subtitle": "Confirm the details below, then continue to secure payment with Stripe.",
    "review.item": "Rental item",
    "review.period": "Rental period",
    "review.days": "days",
    "review.payCta": "Pay with Stripe",
    "review.paying": "Redirecting to Stripe…",
    "review.errPay": "Could not start payment",

    "cancel.title": "Checkout canceled",
    "cancel.body": "No charge was made. The dates you picked are released.",
    "cancel.cta": "Back to browse",

    "browse.title": "Browse rentable pieces",
    "browse.subtitle": "Every piece below is available on the rental storefront. Open an item to choose dates and book.",
    "browse.back": "← Back to home",
    "browse.empty": "No rentable items yet.",

    "item.noCopiesYet":
      "This piece is marked for rental but has no rental copies in the fleet yet. Add copies in the admin inventory, or try again later.",

    "rental.hero.eyebrow": "Lumière Rental",
    "rental.hero.title": "Wear the heirloom. Skip the vault.",
    "rental.hero.subtitle":
      "Insured, expertly cleaned fine jewellery for your night, your wedding, or your shoot — 4 or 7 day rentals, collected at our Hong Kong office.",
    "rental.hero.primaryCta": "Browse rentable pieces",
    "rental.hero.secondaryCta": "How rental works",
    "rental.howItWorks.title": "How rental works",
    "rental.howItWorks.subtitle":
      "Three simple steps. No surprises, no hidden fees, no apologies needed at customs.",
    "rental.steps.1.title": "1. Reserve",
    "rental.steps.1.body":
      "Pick the piece and rental window. We confirm availability the same day.",
    "rental.steps.2.title": "2. Wear",
    "rental.steps.2.body":
      "Review your booking on-site, then pay securely with Stripe.",
    "rental.steps.3.title": "3. Pick up & return",
    "rental.steps.3.body":
      "Collect at our Hong Kong office, enjoy your dates, then return the piece in person by the end date.",
    "rental.featured.title": "Featured rentable pieces",
    "rental.featured.subtitle":
      "A short list this season. Each piece offers 4-day or 7-day rentals as a percentage of its retail value, with pickup at our Hong Kong office.",
    "rental.featured.empty":
      "Our rental atelier is taking new pieces in. Check back shortly.",
    "rental.policies.title": "Why our clients trust us",
    "rental.policies.subtitle":
      "Real fine jewellery, fully insured, handled by people who restore heirlooms for a living.",
    "rental.policy.insurance.title": "Insured edge to edge",
    "rental.policy.insurance.body":
      "Every reservation includes full transit and wear insurance. You sign once and we handle the rest.",
    "rental.policy.cleaning.title": "Pro cleaning between renters",
    "rental.policy.cleaning.body":
      "Each piece is ultrasonic-cleaned and inspected by our atelier between renters.",
    "rental.policy.flexibility.title": "Flexible windows",
    "rental.policy.flexibility.body":
      "4-day or 7-day rentals. Need more time? Ask us about extending before your return date.",
    "rental.cta.title": "Have a black-tie event coming up?",
    "rental.cta.body":
      "Reserve now and we'll set the piece aside. Most reservations confirm within an hour during business days.",
    "rental.cta.button": "Reserve a piece",
    "rental.trust.insured": "Fully insured rentals",
    "rental.trust.delivery": "Door-to-door delivery",
    "rental.trust.pickup": "Hong Kong office pickup",
    "rental.trust.returns": "In-person returns",
    "rental.title": "Lumière Rental",
    "rental.metadata.description":
      "Insured fine jewellery rental from Lumière. Reserve heirloom-quality pieces for your evening, your wedding, or your shoot.",
    "rental.snapshot.available": "Rentable pieces",
    "rental.snapshot.copies": "Total rental copies",
    "rental.snapshot.tiers": "Tiered rental options",
    "rental.snapshot.plans": "Rental plans",
    "rental.snapshot.planLengths": "4 & 7 days",
    "rental.card.from": "From {price}",
    "rental.card.daily": "{price} / day",
    "rental.card.fixed": "{price} for {days} days",
    "rental.card.plans": "4 days: {price4} · 7 days: {price7}",
    "rental.card.priceOnRequest": "Price on request",
    "rental.card.view": "View details",
    "rental.badge.copies": "{n} copies",
    "rental.badge.tiers": "{n} tiers",
    "rental.badge.plans": "4 & 7 days",

    "lang.switchLabel": "Language",
  },
  "zh-Hant": {
    "brand.name": "Lumière",
    "brand.tagline": "租賃",
    "nav.browse": "瀏覽",
    "nav.howItWorks": "租借流程",
    "nav.buyAt": "前往 Lumière 商城 →",
    "nav.admin": "管理後台",
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
    "how.s3.body": "請於開始日前至香港辦公室取件。",
    "how.s4": "享用並寄回",
    "how.s4.body": "盡情配戴後,於結束日前以預付信封寄回即可。",

    "item.material": "材質",
    "item.gemstone": "寶石",
    "book.title": "預訂此件商品",
    "book.startDate": "租賃開始日",
    "book.endDate": "結束日期",
    "book.endDateAuto": "結束日期(自動)",
    "book.daysSummary": "共 {days} 天 · 租金 {price}",
    "book.planHint": "4 天方案：定價之 {pct4}% · 7 天方案：{pct7}%（港幣）",
    "book.pickupOnly":
      "租賃僅限於香港辦公室現場取件與歸還,不提供租賃品寄送服務。",
    "book.rentalPlan": "租賃天數",
    "book.plan4": "4 天",
    "book.plan7": "7 天",
    "book.periodSummary":
      "{start} 至 {end}（共 {days} 天）· 定價之 {pct}% · {price}",
    "book.fobTerms": "FOB - Hong Kong Office",
    "book.fulfillment": "取件方式",
    "book.ship": "宅配到府",
    "book.pickup": "門市取貨",
    "book.shippingAddress": "寄送地址",
    "book.pickupSlot": "辦公室取件日期與時間",
    "book.yourName": "您的姓名",
    "book.email": "電子郵件",
    "book.waiver": "加購損壞保障 — {price}。涵蓋輕微損傷,讓您毋須為修復費用煩惱。",
    "book.rental": "租金",
    "book.damageWaiver": "損壞保障",
    "book.total": "合計",
    "book.cta": "預訂並付款",
    "book.ctaReview": "前往結帳預覽",
    "book.redirecting": "儲存中…",
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
    "success.body":
      "感謝您。我們將寄出預訂詳情,請依約至香港辦公室取件。",
    "success.cta": "繼續瀏覽",

    "review.title": "確認預訂內容",
    "review.subtitle": "請確認以下資料,然後以 Stripe 安全付款。",
    "review.item": "租賃商品",
    "review.period": "租賃期間",
    "review.days": "天",
    "review.payCta": "使用 Stripe 付款",
    "review.paying": "前往 Stripe…",
    "review.errPay": "無法開始付款",

    "cancel.title": "結帳已取消",
    "cancel.body": "尚未產生任何費用,您所選的日期已釋出。",
    "cancel.cta": "返回瀏覽",

    "browse.title": "瀏覽可租賃商品",
    "browse.subtitle": "以下每件作品皆可在租賃前台預訂。開啟商品頁即可選擇日期並完成預約。",
    "browse.back": "← 返回首頁",
    "browse.empty": "目前尚無可租商品。",

    "item.noCopiesYet":
      "此商品已標記為可租賃,但尚未建立可租實體庫存。請於後台庫存新增實體,或稍後再試。",

    "rental.hero.eyebrow": "Lumière 租賃服務",
    "rental.hero.title": "戴出傳家寶,不必鎖在保險箱。",
    "rental.hero.subtitle":
      "全程保險、專業清潔的高級珠寶租賃 — 4 或 7 天方案,於香港辦公室取件。",
    "rental.hero.primaryCta": "瀏覽可租賃商品",
    "rental.hero.secondaryCta": "了解租賃流程",
    "rental.howItWorks.title": "租賃流程",
    "rental.howItWorks.subtitle": "三個簡單步驟,沒有意外、沒有隱藏費用、不必在海關尷尬解釋。",
    "rental.steps.1.title": "1. 預約",
    "rental.steps.1.body": "選擇商品與租賃日期,我們當日完成可用性確認。",
    "rental.steps.2.title": "2. 確認並付款",
    "rental.steps.2.body": "於結帳頁確認預訂後,以 Stripe 安全付款。",
    "rental.steps.3.title": "3. 取件與歸還",
    "rental.steps.3.body":
      "至香港辦公室取件,於租期內配戴,結束日前親自歸還。",
    "rental.featured.title": "本季精選租賃",
    "rental.featured.subtitle":
      "本季精選租賃單品,提供 4 天或 7 天方案（按定價百分比計算）,於香港辦公室取件。",
    "rental.featured.empty": "目前正在引進新作品,請稍後再回來看看。",
    "rental.policies.title": "顧客為何放心選擇我們",
    "rental.policies.subtitle":
      "真正的高級珠寶,全程保險,並由專業修復傳家寶的工坊團隊維護。",
    "rental.policy.insurance.title": "全程保險",
    "rental.policy.insurance.body":
      "每筆預約皆包含運送與配戴保險,只需簽署一次,後續由我們處理。",
    "rental.policy.cleaning.title": "出借前後專業清潔",
    "rental.policy.cleaning.body": "每件作品於每次出借前後皆經超音波清潔與工坊檢查。",
    "rental.policy.flexibility.title": "彈性方案",
    "rental.policy.flexibility.body":
      "可選 4 天或 7 天租賃。需要更長時間請於歸還日前與我們聯絡。",
    "rental.cta.title": "近期有重要的正式場合?",
    "rental.cta.body":
      "立即預約,我們會為您保留商品,大多數預約於工作日一小時內完成確認。",
    "rental.cta.button": "立即預約",
    "rental.trust.insured": "全程保險",
    "rental.trust.delivery": "宅配到府",
    "rental.trust.pickup": "香港辦公室取件",
    "rental.trust.returns": "現場歸還",
    "rental.title": "Lumière 租賃服務",
    "rental.metadata.description":
      "Lumière 提供全程保險的高級珠寶租賃,為您的晚宴、婚禮或拍攝預訂傳家級工藝作品。",
    "rental.snapshot.available": "可租賃商品",
    "rental.snapshot.copies": "可租賃實體總數",
    "rental.snapshot.tiers": "分級租賃方案",
    "rental.snapshot.plans": "租賃方案",
    "rental.snapshot.planLengths": "4 與 7 天",
    "rental.card.from": "{price} 起",
    "rental.card.daily": "{price} / 天",
    "rental.card.fixed": "{days} 天 {price}",
    "rental.card.plans": "4 天：{price4} · 7 天：{price7}",
    "rental.card.priceOnRequest": "價格另洽",
    "rental.card.view": "查看詳情",
    "rental.badge.copies": "{n} 件實體",
    "rental.badge.tiers": "{n} 種方案",
    "rental.badge.plans": "4 與 7 天",

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
