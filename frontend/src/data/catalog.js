// Real Pain Away of Philly catalog (developer brief §4).
// Names are bilingual (always shown EN + 中文); descriptions switch with language.

export const durations = [
  { id: '30m', pill: '30 min', labelEn: '30 min', labelZh: '30 分钟', short: '30 min', minutes: 30, price: 50 },
  { id: '1h', pill: '1 hour', labelEn: '1 hour', labelZh: '1 小时', short: '1 hr', minutes: 60, price: 80 },
  { id: '90m', pill: '1.5 hr', labelEn: '1.5 hr', labelZh: '1.5 小时', short: '1.5 hr', minutes: 90, price: 120 },
  { id: '2h', pill: '2 hr', labelEn: '2 hours', labelZh: '2 小时', short: '2 hr', minutes: 120, price: 160 },
]

// type: 'duration' → pick a duration tier + a technique (price from tier)
//       'fixed'    → pick one service (each has its own duration + price)
export const categories = [
  {
    id: 'body',
    nameEn: 'Body Massage',
    nameZh: '按摩',
    type: 'duration',
    techniques: [
      { id: 'tuina', nameEn: 'Tui-Na', nameZh: '推拿', descEn: 'Clinical Chinese bodywork for real pain relief', descZh: '专业中医推拿，有效缓解疼痛' },
      { id: 'swedish', nameEn: 'Swedish', nameZh: '瑞典式', descEn: 'Light, flowing pressure to fully unwind', descZh: '轻柔流畅手法，彻底放松身心' },
      { id: 'deep', nameEn: 'Deep Tissue', nameZh: '深层组织', descEn: 'Firm pressure that digs out chronic knots', descZh: '深层力度，化解慢性肌肉结节' },
      { id: 'sports', nameEn: 'Sports', nameZh: '运动', descEn: 'Recover faster, move freer after training', descZh: '加速恢复，训练后更灵活自如' },
      { id: 'prenatal', nameEn: 'Prenatal', nameZh: '孕期', descEn: 'Gentle, pregnancy-safe comfort & relief', descZh: '温和孕期安全，舒缓孕期不适' },
      { id: 'scalp', nameEn: 'Scalp/Facial Massage', nameZh: '头皮/面部按摩', descEn: 'Eases tension headaches & melts mental stress', descZh: '缓解紧张性头痛，释放精神压力' },
    ],
  },
  {
    id: 'reflexology',
    nameEn: 'Reflexology',
    nameZh: '脚部按摩',
    type: 'duration',
    techniques: [
      { id: 'foot', nameEn: 'Foot Reflexology', nameZh: '足疗', descEn: 'Foot pressure-point therapy', descZh: '足部反射区疗法' },
      { id: 'hand', nameEn: 'Hand Reflexology', nameZh: '手疗', descEn: 'Hand pressure-point therapy', descZh: '手部反射区疗法' },
    ],
  },
  {
    id: 'cupping',
    nameEn: 'Cupping',
    nameZh: '拔罐',
    type: 'fixed',
    services: [
      { id: 'fire', nameEn: 'Fire Cupping', nameZh: '火罐', min: 20, price: 40, descEn: 'Deep suction to release tension', descZh: '深层吸力，释放肌肉紧张' },
      { id: 'moving', nameEn: 'Moving Cupping', nameZh: '走罐', min: 20, price: 40, descEn: 'Gliding cups loosen wide, stiff areas', descZh: '走罐松解大面积僵硬' },
    ],
  },
  {
    id: 'specialty',
    nameEn: 'Traditional & Specialty',
    nameZh: '',
    type: 'fixed',
    services: [
      { id: 'moxa', nameEn: 'Moxibustion', nameZh: '艾灸', min: 30, price: 60, descEn: 'Herbal heat for deep aches & cold', descZh: '艾草温热，驱寒缓解深层酸痛' },
      { id: 'guasha', nameEn: 'Gua Sha', nameZh: '刮痧', min: 20, price: 40, descEn: 'Scraping that boosts circulation & recovery', descZh: '刮痧促进循环，加速身体恢复' },
      { id: 'facialguasha', nameEn: 'Facial Gua Sha', nameZh: '面部刮痧', min: 20, price: 40, descEn: 'Sculpts, de-puffs & brightens your face', descZh: '面部刮痧，紧致消肿提亮肤色' },
      { id: 'footshape', nameEn: 'Foot Shaping', nameZh: '修脚', min: 20, price: 40, descEn: 'Therapeutic reset for tired feet', descZh: '理疗修复，舒缓疲惫双足' },
      { id: 'ear', nameEn: 'Ear Cleansing', nameZh: '采耳', min: 20, price: 40, descEn: 'Gentle, traditional ear care', descZh: '温和传统采耳护理' },
    ],
  },
]

// Admin-configurable add-on list (brief §4 / §11.5). Hot Stones is complimentary ($0).
export const addons = [
  { id: 'hotstones', nameEn: 'Hot Stones', nameZh: '热石', descEn: 'Complimentary on request', descZh: '应要求免费提供', price: 0, free: true, min: 0 },
  { id: 'firecupping', nameEn: 'Fire Cupping', nameZh: '火罐', descEn: 'Add-on · 30 min', descZh: '附加 · 30 分钟', price: 40, min: 30 },
  { id: 'guasha', nameEn: 'Gua Sha', nameZh: '刮痧', descEn: 'Add-on · 30 min', descZh: '附加 · 30 分钟', price: 40, min: 30 },
  { id: 'ear', nameEn: 'Ear Cleansing', nameZh: '采耳', descEn: 'Add-on · 30 min', descZh: '附加 · 30 分钟', price: 40, min: 30 },
]

// Combo packages — fill each slot with any technique (brief §4d).
export const combos = [
  { id: 'combo2', nameEn: '2-service combo', nameZh: '双项套餐', slots: 2, durationEn: '1 hour', durationZh: '1 小时', minutes: 60, price: 80 },
  { id: 'combo3', nameEn: '3-service combo', nameZh: '三项套餐', slots: 3, durationEn: '1.5 hr', durationZh: '1.5 小时', minutes: 90, price: 120 },
  { id: 'combo4', nameEn: '4-service combo', nameZh: '四项套餐', slots: 4, durationEn: '2 hours', durationZh: '2 小时', minutes: 120, price: 160 },
]

// Options for filling combo slots. Body-work categories collapse to a single
// entry (one "Body Massage" / "Reflexology" rather than each technique), while
// fixed services stay listed individually.
export const comboOptions = categories.flatMap((cat) =>
  cat.type === 'duration'
    ? [{ id: cat.id, nameEn: cat.nameEn, nameZh: cat.nameZh }]
    : cat.services.map((it) => ({
        id: `${cat.id}:${it.id}`,
        nameEn: it.nameEn,
        nameZh: it.nameZh,
      })),
)

// ---- lookups ----
export const getCategory = (id) => categories.find((c) => c.id === id)
export const getDuration = (id) => durations.find((d) => d.id === id)
export const getCombo = (id) => combos.find((c) => c.id === id)
export const getAddon = (id) => addons.find((a) => a.id === id)

export function getItems(category) {
  if (!category) return []
  return category.type === 'duration' ? category.techniques : category.services
}
export const getItem = (catId, itemId) =>
  getItems(getCategory(catId)).find((it) => it.id === itemId)

// Bilingual name helper: "English 中文" (中文 omitted when empty).
export const bilingual = (item) =>
  item ? `${item.nameEn}${item.nameZh ? ` ${item.nameZh}` : ''}` : ''

// Single-language name — English by default, Chinese only when translated.
export const localName = (item, lang) =>
  (lang === 'zh' && item?.nameZh ? item.nameZh : item?.nameEn) ?? ''

// ---- pricing ----
export function basePrice(sel) {
  if (!sel) return 0
  if (sel.mode === 'combo') return getCombo(sel.comboId)?.price ?? 0
  const cat = getCategory(sel.categoryId)
  if (!cat) return 0
  if (cat.type === 'duration') return getDuration(sel.durationId)?.price ?? 0
  return getItem(sel.categoryId, sel.pickId)?.price ?? 0
}

export const addonsPrice = (sel) =>
  (sel?.addonIds ?? []).reduce((sum, id) => sum + (getAddon(id)?.price ?? 0), 0)

export const selectionTotal = (sel) => basePrice(sel) + addonsPrice(sel)

// How long the appointment runs, in minutes — drives the time-slot spacing.
// Add-on durations are stacked on top of the base service (hot stones is free and
// time-inclusive with min: 0, so it adds nothing).
// A 10-minute prep/cleaning buffer is added to every slot.
const PREP_BUFFER_MIN = 10
export function selectionMinutes(sel) {
  if (!sel) return 60

  // 1. Base service duration
  let base
  if (sel.mode === 'combo') { base = getCombo(sel.comboId)?.minutes ?? 60 }
  else {
    const cat = getCategory(sel.categoryId)
    if (!cat) { base = 60 }
    else if (cat.type === 'duration') { base = getDuration(sel.durationId)?.minutes ?? 60 }
    else { base = getItem(sel.categoryId, sel.pickId)?.min ?? 30 }
  }

  // 2. Stack paid add-on durations (free/inclusive addons have min: 0)
  const addonMinutes = (sel.addonIds ?? []).reduce((sum, id) => {
    const a = getAddon(id)
    return sum + (a?.min ?? 0)
  }, 0)

  return base + addonMinutes + PREP_BUFFER_MIN
}

// Tip amount from the chosen tip option (percent of services, custom $, or none).
// Tips are only collected when prepaying — paying at the store means no tip now.
export function computeTip({ tipMode, tipCustom, payment }, servicesSubtotal) {
  if (payment === 'visit') return 0
  if (tipMode === '20') return servicesSubtotal * 0.2
  if (tipMode === '25') return servicesSubtotal * 0.25
  if (tipMode === '30') return servicesSubtotal * 0.3
  if (tipMode === 'custom') return Math.max(0, Number(tipCustom) || 0)
  return 0
}

export const hasSelection = (sel) => {
  if (!sel) return false
  if (sel.mode === 'combo') return sel.slots?.every(Boolean) ?? false
  const cat = getCategory(sel.categoryId)
  if (!cat) return false
  return cat.type === 'duration' ? !!(sel.durationId && sel.pickId) : !!sel.pickId
}

// Format a duration in minutes to a short label, e.g. 90 → "1.5 hr".
export function formatMinutes(minutes, lang = 'en') {
  if (!minutes || minutes <= 0) return ''
  if (minutes < 60) return `${minutes} ${lang === 'zh' ? '分钟' : 'min'}`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} ${lang === 'zh' ? '小时' : 'hr'}`
  if (m === 30) return `${h}.5 ${lang === 'zh' ? '小时' : 'hr'}`
  return `${h} ${lang === 'zh' ? '小时' : 'hr'} ${m} ${lang === 'zh' ? '分钟' : 'min'}`
}

// Compact label for the summary main line, e.g. "Tui-Na (1 hr)".
// Shows total duration including add-ons.
export function summaryLabel(sel) {
  if (!sel) return ''
  if (sel.mode === 'combo') return getCombo(sel.comboId)?.nameEn ?? ''
  const cat = getCategory(sel.categoryId)
  const item = getItem(sel.categoryId, sel.pickId)
  if (!cat || !item) return ''
  if (cat.type === 'duration') {
    return `${item.nameEn} (${formatMinutes(selectionMinutes(sel))})`
  }
  return item.nameEn
}

// Compact line for the confirmation page, e.g. "Tui-Na, 1 hr" (Chinese when translated).
// Shows total duration including add-ons.
export function confirmLabel(sel, lang = 'en') {
  if (!sel) return ''
  if (sel.mode === 'combo') return localName(getCombo(sel.comboId), lang)
  const cat = getCategory(sel.categoryId)
  const item = getItem(sel.categoryId, sel.pickId)
  if (!cat || !item) return ''
  const totalMin = selectionMinutes(sel)
  if (cat.type === 'duration') {
    return `${localName(item, lang)}, ${formatMinutes(totalMin, lang)}`
  }
  return `${localName(item, lang)}, ${formatMinutes(totalMin, lang)}`
}

// Detailed line for a confirmed-guest row, e.g. "Tui-Na 推拿 · 1 hr · Body Massage".
// Shows total duration including add-ons.
export function detailLine(sel, lang = 'en') {
  if (!sel) return ''
  if (sel.mode === 'combo') {
    const combo = getCombo(sel.comboId)
    const total = selectionMinutes(sel)
    const base = `${localName(combo, lang)} · ${lang === 'zh' ? combo?.durationZh : combo?.durationEn}`
    if (total > (combo?.minutes ?? 0)) {
      return `${base} + ${formatMinutes(total - (combo?.minutes ?? 0), lang)}`
    }
    return base
  }
  const cat = getCategory(sel.categoryId)
  const item = getItem(sel.categoryId, sel.pickId)
  if (!cat || !item) return ''
  return `${localName(item, lang)} · ${formatMinutes(selectionMinutes(sel), lang)} · ${localName(cat, lang)}`
}
