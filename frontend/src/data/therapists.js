// Placeholder roster — real staff names/bios/genders to be provided (brief §11.7).
export const therapists = [
  { id: 'david', name: 'David Xia', gender: 'male', descEn: 'Massage specialist · Tui-Na & deep tissue', descZh: '按摩专家 · 推拿与深层组织' },
  { id: 'kevin', name: 'Kevin An', gender: 'male', descEn: "20+ years' experience · cupping & TCM", descZh: '20+ 年经验 · 拔罐与中医' },
  { id: 'andy', name: 'Andy Ji', gender: 'male', descEn: 'Reflexology & pressure-point therapy', descZh: '足疗与穴位疗法' },
  { id: 'steven', name: 'Steven Zheng', gender: 'male', descEn: 'Warm approach · full-body bodywork', descZh: '亲切贴心 · 全身理疗' },
  { id: 'lucy', name: 'Lucy Gao', gender: 'female', descEn: 'Family TCM tradition · gua sha & cupping', descZh: '家传中医 · 刮痧与拔罐' },
  { id: 'sally', name: 'Sally Wang', gender: 'female', descEn: 'Attentive · relaxation & prenatal', descZh: '细致入微 · 放松与孕期' },
  { id: 'yoyo', name: 'Yo-Yo Liu', gender: 'female', descEn: 'Passionate about therapeutic massage', descZh: '热衷于理疗按摩' },
]

export const getTherapist = (id) => therapists.find((th) => th.id === id)

// Resolve a guest's preference to an actual practitioner for display — even
// "no preference" shows the matched practitioner we'd assign (varied by index).
export function assignedTherapist(pref, index = 0) {
  if (pref?.therapistId) return getTherapist(pref.therapistId)
  if (pref?.mode === 'female' || pref?.mode === 'male') {
    const pool = therapists.filter((th) => th.gender === pref.mode)
    return pool[index % pool.length] ?? pool[0]
  }
  return therapists[index % therapists.length]
}

// Resolves a preference to a display token: a practitioner's name when one is
// picked, the gender ('female'/'male'), or 'none' for no preference / no pick.
export function therapistLabel(pref) {
  if (pref?.therapistId) return getTherapist(pref.therapistId)?.name ?? 'none'
  if (pref?.mode === 'female' || pref?.mode === 'male') return pref.mode
  return 'none'
}
