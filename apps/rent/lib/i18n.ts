export type Locale = "en" | "zh-Hant" | "zh-Hans";
export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh-Hant", label: "繁體中文" },
  { code: "zh-Hans", label: "简体中文" },
];
export const LOCALE_COOKIE = "locale";

export const dict = {
  en: {
    "brand.name": "Lumière",
    "brand.tagline": "Rentals",
    "nav.browse": "Browse",
    "nav.howItWorks": "How it works",
    "nav.rings": "Rings",
    "nav.necklaces": "Necklaces",
    "nav.earrings": "Earrings",
    "nav.bracelets": "Bracelets",
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
      "checkout securely with Stripe for the rental plus a refundable security deposit.",
    "how.s3": "Receive",
    "how.s3.body": "pick up at our Hong Kong office ahead of your start date.",
    "how.s4": "Enjoy & return in person",
    "how.s4.body":
      "wear it for your dates, then bring it back to our office by your end date — no mail-in returns. A specialist inspects the piece and refunds your deposit on the spot.",

    "item.material": "Material",
    "item.gemstone": "Gemstone",
    "book.title": "Book this piece",
    "book.startDate": "Rental start date",
    "book.endDate": "End date",
    "book.endDateAuto": "End date (auto)",
    "book.daysSummary": "{days} day(s) · {price} rental",
    "book.planHint": "4-day plan: {pct4}% of retail · 7-day plan: {pct7}% (HKD)",
    "book.pickupOnly":
      "Rentals are collected and returned in person at our Hong Kong office only — we do not ship rental items or accept mail-in returns.",
    "book.deposit": "Refundable deposit",
    "book.depositRefundHint": "Refunded at the office after staff inspection when you return.",
    "book.depositPolicy":
      "A {pct}% security deposit of the piece’s reference price is charged at checkout and refunded on site after return inspection.",
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
    "book.phone": "Phone",
    "book.email": "Email",
    "book.returnSlot": "Office return date & time",
    "book.returnSlotHint":
      "Defaults to the last day of your rental period. You can adjust the time; the date must stay on that day.",
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
    "book.errContact": "Please enter your name, phone number, and email.",
    "book.errPhone": "Please enter a valid phone number (at least 5 characters).",
    "book.errReturnSlot": "Please choose your office return date and time.",
    "book.errReturnDay": "Return must be on the last day of your rental ({end}).",
    "book.errAddress": "Shipping address is required.",
    "book.errPickup": "Please choose a pickup date and time.",
    "book.errCheckout": "Could not create booking",
    "book.priceLabel.daily": "{price} per day",
    "book.priceLabel.fixed": "{price} for {days} days",
    "book.priceLabel.tieredJoin": " · ",
    "book.priceLabel.none": "Pricing not configured",

    "success.title": "Booking confirmed!",
    "success.body":
      "Thank you. We’ll email your booking details. Collect your piece at our Hong Kong office as arranged. When you return it in person, our team will inspect it and refund your deposit on the spot.",
    "success.cta": "Browse more",

    "review.title": "Review your booking",
    "review.subtitle":
      "Confirm the details below, then pay the rental and refundable deposit securely with Stripe.",
    "review.item": "Rental item",
    "review.period": "Rental period",
    "review.returnSlot": "Office return",
    "review.phone": "Phone",
    "review.days": "days",
    "review.reserveCta":
      "Great choice. Complete checkout now and we will reserve this piece for your booking window. If anything is not satisfactory at inspection, we will promptly refund your deposit.",
    "review.reserveFeeNote":
      "#1 Different payment methods may involve different handling fees.",
    "review.payCta": "Pay with Stripe",
    "review.paying": "Redirecting to Stripe…",
    "review.errPay": "Could not start payment",

    "cancel.title": "Checkout canceled",
    "cancel.body": "No charge was made. The dates you picked are released.",
    "cancel.cta": "Back to browse",

    "browse.title": "Browse rentable pieces",
    "browse.subtitle": "Every piece below is available on the rental storefront. Open an item to choose dates and book.",
    "browse.inCategory": "Category: {name}",
    "browse.clearCategory": "All categories",
    "browse.back": "← Back to home",
    "browse.empty": "No rentable items yet.",

    "search.placeholder": "Search rentable pieces…",
    "search.submit": "Search",
    "search.showingFor": "{n} result(s) for “{q}”",
    "search.clear": "Clear search",
    "search.noResults": "No rentable pieces match “{q}”.",
    "browse.emptyCategory": "No rentable pieces in this category yet.",

    "item.noCopiesYet":
      "This piece is marked for rental but has no rental copies in the fleet yet. Add copies in the admin inventory, or try again later.",

    "rental.shopByCategory": "Shop by category",
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
    "rental.steps.2.title": "2. Confirm & pay",
    "rental.steps.2.body":
      "Review your booking, then pay rental plus a refundable security deposit with Stripe.",
    "rental.steps.3.title": "3. Pick up & return",
    "rental.steps.3.body":
      "Collect at our Hong Kong office, enjoy your dates, then return in person by the end date — a specialist inspects the piece and refunds your deposit on site.",
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
    "nav.rings": "戒指",
    "nav.necklaces": "項鍊",
    "nav.earrings": "耳環",
    "nav.bracelets": "手鍊",
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
    "how.s2.body": "透過 Stripe 安全支付租金與可退還之保證金。",
    "how.s3": "收件",
    "how.s3.body": "請於開始日前至香港辦公室取件。",
    "how.s4": "享用並親自歸還",
    "how.s4.body":
      "於租期內配戴後,請在結束日前親自帶回辦公室歸還（不接受郵寄退件）。專人驗收後,當場退還保證金。",

    "item.material": "材質",
    "item.gemstone": "寶石",
    "book.title": "預訂此件商品",
    "book.startDate": "租賃開始日",
    "book.endDate": "結束日期",
    "book.endDateAuto": "結束日期(自動)",
    "book.daysSummary": "共 {days} 天 · 租金 {price}",
    "book.planHint": "4 天方案：定價之 {pct4}% · 7 天方案：{pct7}%（港幣）",
    "book.pickupOnly":
      "租賃僅限於香港辦公室現場取件與歸還,不提供寄送,亦不接受郵寄退件。",
    "book.deposit": "可退還保證金",
    "book.depositRefundHint": "歸還時由專人驗收後於辦公室當場退還。",
    "book.depositPolicy":
      "結帳時另收參考定價之 {pct}% 作為保證金,於現場驗收歸還後退還。",
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
    "book.phone": "電話",
    "book.email": "電子郵件",
    "book.returnSlot": "辦公室歸還日期與時間",
    "book.returnSlotHint":
      "預設為租期最後一日,可調整時間;日期須維持在該日。",
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
    "book.errContact": "請輸入姓名、電話與電子郵件。",
    "book.errPhone": "請輸入有效的電話號碼（至少 5 個字元）。",
    "book.errReturnSlot": "請選擇辦公室歸還日期與時間。",
    "book.errReturnDay": "歸還日須為租期最後一日（{end}）。",
    "book.errAddress": "請輸入寄送地址。",
    "book.errPickup": "請選擇取貨日期與時間。",
    "book.errCheckout": "無法建立訂單",
    "book.priceLabel.daily": "每日 {price}",
    "book.priceLabel.fixed": "{days} 天 {price}",
    "book.priceLabel.tieredJoin": " · ",
    "book.priceLabel.none": "尚未設定價格",

    "success.title": "預訂已完成!",
    "success.body":
      "感謝您。我們將寄出預訂詳情,請依約至香港辦公室取件。歸還時請親自帶回,專人驗收後將於現場退還保證金。",
    "success.cta": "繼續瀏覽",

    "review.title": "確認預訂內容",
    "review.subtitle": "請確認以下資料,然後以 Stripe 支付租金與可退還保證金。",
    "review.item": "租賃商品",
    "review.period": "租賃期間",
    "review.returnSlot": "辦公室歸還",
    "review.phone": "電話",
    "review.days": "天",
    "review.reserveCta":
      "您好,已找到您的心頭好。您現在可立即結帳,我們會為您預留該租期的心愛貨品;若您於驗收時有任何不滿意,我司會盡快退回訂金。",
    "review.reserveFeeNote": "#1 不同付款方式可能產生不同手續費。",
    "review.payCta": "使用 Stripe 付款",
    "review.paying": "前往 Stripe…",
    "review.errPay": "無法開始付款",

    "cancel.title": "結帳已取消",
    "cancel.body": "尚未產生任何費用,您所選的日期已釋出。",
    "cancel.cta": "返回瀏覽",

    "browse.title": "瀏覽可租賃商品",
    "browse.subtitle": "以下每件作品皆可在租賃前台預訂。開啟商品頁即可選擇日期並完成預約。",
    "browse.inCategory": "分類：{name}",
    "browse.clearCategory": "全部分類",
    "browse.back": "← 返回首頁",
    "browse.empty": "目前尚無可租商品。",

    "search.placeholder": "搜尋可租商品…",
    "search.submit": "搜尋",
    "search.showingFor": "「{q}」· 共 {n} 筆",
    "search.clear": "清除搜尋",
    "search.noResults": "沒有與「{q}」相符的可租商品。",
    "browse.emptyCategory": "此分類目前尚無可租商品。",

    "item.noCopiesYet":
      "此商品已標記為可租賃,但尚未建立可租實體庫存。請於後台庫存新增實體,或稍後再試。",

    "rental.shopByCategory": "依類別選購",
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
    "rental.steps.2.body": "確認預訂後,以 Stripe 支付租金與可退還保證金。",
    "rental.steps.3.title": "3. 取件與歸還",
    "rental.steps.3.body":
      "至香港辦公室取件,於租期內配戴,結束日前親自歸還；專人驗收後於現場退還保證金。",
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
  "zh-Hans": {
    "brand.name": "Lumière",
    "brand.tagline": "租赁",
    "nav.browse": "浏览",
    "nav.howItWorks": "租借流程",
    "nav.rings": "戒指",
    "nav.necklaces": "项链",
    "nav.earrings": "耳环",
    "nav.bracelets": "手链",
    "nav.buyAt": "前往 Lumière 商城 →",
    "nav.admin": "管理后台",
    "footer.copyright": "Lumière 租赁",

    "home.hero.title": "为重要时刻,戴上不凡。",
    "home.hero.subtitle":
      "为重要场合准备的设计师珠宝,可租一晚、一个周末或一整周。",
    "home.available": "目前可租",
    "home.empty": "目前暂无可租商品。",

    "price.perDay": "每日 {price}",
    "price.fixedFor": "{days} 天 {price}",
    "price.from": "{price} 起",
    "price.dash": "—",

    "how.title": "租赁流程",
    "how.s1": "浏览",
    "how.s1.body": "挑选您喜爱的珠宝,并选择租借日期。",
    "how.s2": "预订并付款",
    "how.s2.body": "通过 Stripe 安全支付租金与可退还保证金。",
    "how.s3": "收件",
    "how.s3.body": "请于开始日前至香港办公室取件。",
    "how.s4": "享用并亲自归还",
    "how.s4.body":
      "在租期内佩戴后,请在结束日前亲自带回办公室归还（不接受邮寄退件）。专人验收后,当场退还保证金。",

    "item.material": "材质",
    "item.gemstone": "宝石",
    "book.title": "预约此件商品",
    "book.startDate": "租赁开始日",
    "book.endDate": "结束日期",
    "book.endDateAuto": "结束日期(自动)",
    "book.daysSummary": "共 {days} 天 · 租金 {price}",
    "book.planHint": "4 天方案：定价之 {pct4}% · 7 天方案：{pct7}%（港币）",
    "book.pickupOnly":
      "租赁仅限在香港办公室现场取件与归还,不提供寄送,亦不接受邮寄退件。",
    "book.deposit": "可退还保证金",
    "book.depositRefundHint": "归还时由专人验收后在办公室当场退还。",
    "book.depositPolicy":
      "结账时另收参考定价的 {pct}% 作为保证金,在现场验收归还后退还。",
    "book.rentalPlan": "租赁天数",
    "book.plan4": "4 天",
    "book.plan7": "7 天",
    "book.periodSummary":
      "{start} 至 {end}（共 {days} 天）· 定价之 {pct}% · {price}",
    "book.fobTerms": "FOB - Hong Kong Office",
    "book.fulfillment": "取件方式",
    "book.ship": "宅配到府",
    "book.pickup": "门市取货",
    "book.shippingAddress": "寄送地址",
    "book.pickupSlot": "办公室取件日期与时间",
    "book.yourName": "您的姓名",
    "book.phone": "电话",
    "book.email": "电子邮件",
    "book.returnSlot": "办公室归还日期与时间",
    "book.returnSlotHint":
      "默认是租期最后一天,可调整时间;日期须保持在该日。",
    "book.waiver": "加购损坏保障 — {price}。涵盖轻微损伤,让您无需为修复费用烦恼。",
    "book.rental": "租金",
    "book.damageWaiver": "损坏保障",
    "book.total": "合计",
    "book.cta": "预约并付款",
    "book.ctaReview": "前往结账预览",
    "book.redirecting": "保存中…",
    "book.bookedDays": "未来 120 天内有 {n} 天已约满",
    "book.errPickDates": "请选择有效的日期",
    "book.errEndBeforeStart": "结束日期必须等于或晚于开始日期",
    "book.errOverlap": "您选择的日期范围内有部分日期已约满。",
    "book.errNameEmail": "请输入您的姓名与电子邮件。",
    "book.errContact": "请输入姓名、电话与电子邮件。",
    "book.errPhone": "请输入有效的电话号码（至少 5 个字符）。",
    "book.errReturnSlot": "请选择办公室归还日期与时间。",
    "book.errReturnDay": "归还日须为租期最后一天（{end}）。",
    "book.errAddress": "请输入寄送地址。",
    "book.errPickup": "请选择取货日期与時間。",
    "book.errCheckout": "无法建立订单",
    "book.priceLabel.daily": "每日 {price}",
    "book.priceLabel.fixed": "{days} 天 {price}",
    "book.priceLabel.tieredJoin": " · ",
    "book.priceLabel.none": "尚未设置价格",

    "success.title": "预约已完成!",
    "success.body":
      "感谢您。我们将发送预约详情,请按约到香港办公室取件。归还时请亲自带回,专人验收后将于现场退还保证金。",
    "success.cta": "继续浏览",

    "review.title": "确认预约内容",
    "review.subtitle": "请确认以下资料,然后通过 Stripe 支付租金与可退还保证金。",
    "review.item": "租赁商品",
    "review.period": "租赁期间",
    "review.returnSlot": "办公室归还",
    "review.phone": "电话",
    "review.days": "天",
    "review.reserveCta":
      "您好,已找到您的心头好。您现在可立即结账,我们会为您预留该租期的心爱货品;若您在验收时有任何不满意,我司会尽快退回订金。",
    "review.reserveFeeNote": "#1 不同付款方式可能会产生不同手续费。",
    "review.payCta": "使用 Stripe 付款",
    "review.paying": "前往 Stripe…",
    "review.errPay": "无法开始付款",

    "cancel.title": "结账已取消",
    "cancel.body": "尚未产生任何费用,您所选的日期已释放。",
    "cancel.cta": "返回浏览",

    "browse.title": "浏览可租赁商品",
    "browse.subtitle": "以下每件作品均可在租赁前台预约。打开商品页即可选择日期并完成预约。",
    "browse.inCategory": "分类：{name}",
    "browse.clearCategory": "全部分类",
    "browse.back": "← 返回首页",
    "browse.empty": "目前暂无可租商品。",

    "search.placeholder": "搜索可租商品…",
    "search.submit": "搜索",
    "search.showingFor": "「{q}」· 共 {n} 笔",
    "search.clear": "清除搜索",
    "search.noResults": "没有与“{q}”相符的可租商品。",
    "browse.emptyCategory": "此分类目前暂无可租商品。",

    "item.noCopiesYet":
      "此商品已标记为可租赁,但尚未建立可租实体库存。请在后台库存新增实体,或稍后再试。",

    "rental.shopByCategory": "按类别选购",
    "rental.hero.eyebrow": "Lumière 租赁服务",
    "rental.hero.title": "戴出传家宝,不必锁在保险箱。",
    "rental.hero.subtitle":
      "全程保险、专业清洁的高级珠宝租赁 — 4 或 7 天方案,在香港办公室取件。",
    "rental.hero.primaryCta": "浏览可租赁商品",
    "rental.hero.secondaryCta": "了解租赁流程",
    "rental.howItWorks.title": "租赁流程",
    "rental.howItWorks.subtitle": "三个简单步骤,没有意外、没有隐藏费用,不用在海关尴尬解释。",
    "rental.steps.1.title": "1. 预约",
    "rental.steps.1.body": "选择商品与租赁日期,我们当日完成可用性确认。",
    "rental.steps.2.title": "2. 确认并付款",
    "rental.steps.2.body": "确认预约后,通过 Stripe 支付租金与可退还保证金。",
    "rental.steps.3.title": "3. 取件与归还",
    "rental.steps.3.body":
      "至香港办公室取件,在租期内佩戴,结束日前亲自归还；专人验收后于现场退还保证金。",
    "rental.featured.title": "本季精选租赁",
    "rental.featured.subtitle":
      "本季精选租赁单品,提供 4 天或 7 天方案（按定价百分比计算）,在香港办公室取件。",
    "rental.featured.empty": "目前正在引进新作品,请稍后再回来看看。",
    "rental.policies.title": "顾客为何放心选择我们",
    "rental.policies.subtitle":
      "真正的高级珠宝,全程保险,并由专业修复传家宝的工坊团队维护。",
    "rental.policy.insurance.title": "全程保险",
    "rental.policy.insurance.body":
      "每笔预约均包含运送与佩戴保险,只需签署一次,后续由我们处理。",
    "rental.policy.cleaning.title": "出借前后专业清洁",
    "rental.policy.cleaning.body": "每件作品在每次出借前后均经超声波清洁与工坊检查。",
    "rental.policy.flexibility.title": "弹性方案",
    "rental.policy.flexibility.body":
      "可选 4 天或 7 天租赁。需要更长时间请在归还日前与我们联系。",
    "rental.cta.title": "近期有重要的正式场合?",
    "rental.cta.body":
      "立即预约,我们会为您保留商品,大多数预约在工作日一小时内完成确认。",
    "rental.cta.button": "立即预约",
    "rental.trust.insured": "全程保险",
    "rental.trust.delivery": "宅配到府",
    "rental.trust.pickup": "香港办公室取件",
    "rental.trust.returns": "现场归还",
    "rental.title": "Lumière 租赁服务",
    "rental.metadata.description":
      "Lumière 提供全程保险的高级珠宝租赁,为您的晚宴、婚礼或拍摄预约传家级工艺作品。",
    "rental.snapshot.available": "可租赁商品",
    "rental.snapshot.copies": "可租赁实体总数",
    "rental.snapshot.tiers": "分级租赁方案",
    "rental.snapshot.plans": "租赁方案",
    "rental.snapshot.planLengths": "4 与 7 天",
    "rental.card.from": "{price} 起",
    "rental.card.daily": "{price} / 天",
    "rental.card.fixed": "{days} 天 {price}",
    "rental.card.plans": "4 天：{price4} · 7 天：{price7}",
    "rental.card.priceOnRequest": "价格另洽",
    "rental.card.view": "查看详情",
    "rental.badge.copies": "{n} 件实体",
    "rental.badge.tiers": "{n} 种方案",
    "rental.badge.plans": "4 与 7 天",

    "lang.switchLabel": "语言",
  }

} as const;

export type DictKey = keyof typeof dict.en;

export function makeT(locale: Locale) {
  return (key: DictKey, vars?: Record<string, string | number>): string => {
    const base = dict[locale];
    const raw = base[key] ?? dict.en[key];
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] !== undefined ? String(vars[k]) : `{${k}}`
    );
  };
}

export function intlLocale(l: Locale): string {
  if (l === "zh-Hant") return "zh-Hant-TW";
  if (l === "zh-Hans") return "zh-CN";
  return "en-US";
}
