// Real Pain Away of Philly catalog (developer brief §4).
// Names are bilingual (always shown EN + 中文); descriptions switch with language.

export const durations = [
  { id: '30m', pill: '30 min', labelEn: '30 min', labelZh: '30 分钟', short: '30 min', price: 50 },
  { id: '1h', pill: '1 hour', labelEn: '1 hour', labelZh: '1 小时', short: '1 hr', price: 80 },
  { id: '90m', pill: '1.5 hr', labelEn: '1.5 hr', labelZh: '1.5 小时', short: '1.5 hr', price: 120 },
  { id: '2h', pill: '2 hr', labelEn: '2 hours', labelZh: '2 小时', short: '2 hr', price: 160 },
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
      { id: 'tuina', nameEn: 'Tui-Na', nameZh: '推拿', descEn: 'Deep, Chinese medical bodywork', descZh: '深层中医理疗' },
      { id: 'swedish', nameEn: 'Swedish', nameZh: '瑞典式', descEn: 'Relaxation, full-body', descZh: '全身放松' },
      { id: 'deep', nameEn: 'Deep Tissue', nameZh: '深层组织', descEn: 'Targets deep tension knots', descZh: '缓解深层紧张' },
      { id: 'sports', nameEn: 'Sports', nameZh: '运动', descEn: 'Active recovery & mobility', descZh: '运动恢复与灵活度' },
      { id: 'prenatal', nameEn: 'Prenatal', nameZh: '孕期', descEn: 'Gentle, pregnancy-safe', descZh: '温和、孕期安全' },
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
      { id: 'fire', nameEn: 'Fire Cupping', nameZh: '火罐', min: 20, price: 40, descEn: 'Classic suction cupping', descZh: '经典火罐疗法' },
      { id: 'moving', nameEn: 'Moving Cupping', nameZh: '走罐', min: 20, price: 40, descEn: 'Gliding cups along meridians', descZh: '沿经络滑动拔罐' },
      { id: 'wet', nameEn: 'Wet Cupping', nameZh: '放血拔罐', min: 10, price: 45, descEn: 'Single acupuncture point only', descZh: '仅限单个穴位' },
    ],
  },
  {
    id: 'specialty',
    nameEn: 'Traditional & Specialty',
    nameZh: '',
    type: 'fixed',
    services: [
      { id: 'moxa', nameEn: 'Moxibustion', nameZh: '艾灸', min: 30, price: 60, descEn: 'Warming herbal heat therapy', descZh: '温热艾草疗法' },
      { id: 'guasha', nameEn: 'Gua Sha', nameZh: '刮痧', min: 20, price: 40, descEn: 'Scraping for circulation', descZh: '促进循环刮拭' },
      { id: 'footshape', nameEn: 'Foot Shaping', nameZh: '修脚', min: 20, price: 40, descEn: 'Pedicure therapy', descZh: '修脚护理' },
      { id: 'ear', nameEn: 'Ear Cleansing', nameZh: '采耳', min: 20, price: 40, descEn: 'Traditional ear care', descZh: '传统采耳护理' },
      { id: 'maternal', nameEn: 'Maternal Massage', nameZh: '产妇按摩', min: 60, price: 80, descEn: 'Prenatal & postnatal support', descZh: '产前产后护理' },
      { id: 'thermo', nameEn: 'Thermo-Therapy', nameZh: '中药热敷', min: 45, price: 35, perPart: true, descEn: 'Hot compress, per body part', descZh: '中药热敷，按部位计费' },
    ],
  },
]

// Admin-configurable add-on list (brief §4 / §11.5). Hot Stones is complimentary ($0).
export const addons = [
  { id: 'hotstones', nameEn: 'Hot Stones', nameZh: '热石', descEn: 'Complimentary on request', descZh: '应要求免费提供', price: 0, free: true },
  { id: 'firecupping', nameEn: 'Fire Cupping', nameZh: '火罐', descEn: 'Add-on · 20 min', descZh: '附加 · 20 分钟', price: 40 },
  { id: 'guasha', nameEn: 'Gua Sha', nameZh: '刮痧', descEn: 'Add-on · 20 min', descZh: '附加 · 20 分钟', price: 40 },
  { id: 'ear', nameEn: 'Ear Cleansing', nameZh: '采耳', descEn: 'Add-on · 20 min', descZh: '附加 · 20 分钟', price: 40 },
]

// Combo packages — fill each slot with any technique (brief §4d).
export const combos = [
  { id: 'combo2', nameEn: '2-service combo', nameZh: '双项套餐', slots: 2, durationEn: '1 hour', durationZh: '1 小时', price: 80 },
  { id: 'combo3', nameEn: '3-service combo', nameZh: '三项套餐', slots: 3, durationEn: '1.5 hr', durationZh: '1.5 小时', price: 120 },
  { id: 'combo4', nameEn: '4-service combo', nameZh: '四项套餐', slots: 4, durationEn: '2 hours', durationZh: '2 小时', price: 160 },
]

// Flat list of every technique/service, usable to fill combo slots.
export const comboOptions = categories.flatMap((cat) =>
  (cat.type === 'duration' ? cat.techniques : cat.services).map((it) => ({
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

// Tip amount from the chosen tip option (percent of services, custom $, or none).
export function computeTip({ tipMode, tipCustom }, servicesSubtotal) {
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

// Compact label for the summary main line, e.g. "Tui-Na (1 hr)".
export function summaryLabel(sel) {
  if (!sel) return ''
  if (sel.mode === 'combo') return getCombo(sel.comboId)?.nameEn ?? ''
  const cat = getCategory(sel.categoryId)
  const item = getItem(sel.categoryId, sel.pickId)
  if (!cat || !item) return ''
  if (cat.type === 'duration') {
    return `${item.nameEn} (${getDuration(sel.durationId)?.short ?? ''})`
  }
  return item.nameEn
}

// Compact line for the confirmation page, e.g. "Tui-Na, 1 hr" (Chinese when translated).
export function confirmLabel(sel, lang = 'en') {
  if (!sel) return ''
  if (sel.mode === 'combo') return localName(getCombo(sel.comboId), lang)
  const cat = getCategory(sel.categoryId)
  const item = getItem(sel.categoryId, sel.pickId)
  if (!cat || !item) return ''
  if (cat.type === 'duration') {
    return `${localName(item, lang)}, ${getDuration(sel.durationId)?.short ?? ''}`
  }
  return `${localName(item, lang)}, ${item.min} min`
}

// Detailed line for a confirmed-guest row, e.g. "Tui-Na 推拿 · 1 hour · Body Massage".
export function detailLine(sel, lang = 'en') {
  if (!sel) return ''
  if (sel.mode === 'combo') {
    const combo = getCombo(sel.comboId)
    return `${localName(combo, lang)} · ${lang === 'zh' ? combo?.durationZh : combo?.durationEn}`
  }
  const cat = getCategory(sel.categoryId)
  const item = getItem(sel.categoryId, sel.pickId)
  if (!cat || !item) return ''
  const dur =
    cat.type === 'duration'
      ? lang === 'zh'
        ? getDuration(sel.durationId)?.labelZh
        : getDuration(sel.durationId)?.labelEn
      : `${item.min} min`
  return `${localName(item, lang)} · ${dur} · ${localName(cat, lang)}`
}
