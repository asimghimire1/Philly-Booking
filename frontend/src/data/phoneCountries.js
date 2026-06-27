// Country phone codes & expected local-digit counts for validation.
// `digits` is the number of local digits after the country code.
const _countries = [
  // Americas
  { code: '+1', name: 'US/CA', label: 'United States / Canada', digits: 10 },
  { code: '+52', name: 'MX', label: 'México (Mexico)', digits: 10 },
  { code: '+55', name: 'BR', label: 'Brasil (Brazil)', digits: 11 },

  // China & nearby
  { code: '+86', name: 'CN', label: '中国 (China)', digits: 11 },
  { code: '+886', name: 'TW', label: '台灣 (Taiwan)', digits: 10 },
  { code: '+852', name: 'HK', label: '香港 (Hong Kong)', digits: 8 },
  { code: '+853', name: 'MO', label: '澳門 (Macau)', digits: 8 },

  // South Asia
  { code: '+977', name: 'NP', label: 'नेपाल (Nepal)', digits: 10 },
  { code: '+91', name: 'IN', label: 'India', digits: 10 },
  { code: '+880', name: 'BD', label: 'বাংলাদেশ (Bangladesh)', digits: 10 },
  { code: '+92', name: 'PK', label: 'پاکستان (Pakistan)', digits: 10 },
  { code: '+94', name: 'LK', label: 'ශ්‍රී ලංකා (Sri Lanka)', digits: 10 },

  // Southeast Asia
  { code: '+66', name: 'TH', label: 'ไทย (Thailand)', digits: 9 },
  { code: '+84', name: 'VN', label: 'Việt Nam (Vietnam)', digits: 10 },
  { code: '+60', name: 'MY', label: 'Malaysia', digits: 10 },
  { code: '+65', name: 'SG', label: 'Singapore', digits: 8 },
  { code: '+63', name: 'PH', label: 'Philippines', digits: 10 },
  { code: '+62', name: 'ID', label: 'Indonesia', digits: 11 },

  // East Asia
  { code: '+81', name: 'JP', label: '日本 (Japan)', digits: 10 },
  { code: '+82', name: 'KR', label: '한국 (South Korea)', digits: 10 },

  // Europe
  { code: '+44', name: 'UK', label: 'United Kingdom', digits: 10 },
  { code: '+49', name: 'DE', label: 'Deutschland (Germany)', digits: 11 },
  { code: '+33', name: 'FR', label: 'France', digits: 9 },
  { code: '+39', name: 'IT', label: 'Italia (Italy)', digits: 10 },
  { code: '+34', name: 'ES', label: 'España (Spain)', digits: 9 },
  { code: '+7', name: 'RU', label: 'Россия (Russia)', digits: 10 },
  { code: '+31', name: 'NL', label: 'Nederland (Netherlands)', digits: 9 },
  { code: '+41', name: 'CH', label: 'Schweiz (Switzerland)', digits: 9 },
  { code: '+46', name: 'SE', label: 'Sverige (Sweden)', digits: 9 },

  // Oceania
  { code: '+61', name: 'AU', label: 'Australia', digits: 9 },
  { code: '+64', name: 'NZ', label: 'New Zealand', digits: 9 },

  // Middle East & Africa
  { code: '+971', name: 'AE', label: 'الإمارات (UAE)', digits: 9 },
  { code: '+972', name: 'IL', label: 'ישראל (Israel)', digits: 9 },
  { code: '+27', name: 'ZA', label: 'South Africa', digits: 9 },

  // South America
  { code: '+56', name: 'CL', label: 'Chile', digits: 9 },
  { code: '+54', name: 'AR', label: 'Argentina', digits: 10 },

  // ⸻ Catch-all fallback (accepts 4–15 digits so no valid number gets rejected) ⸻
  { code: '', name: 'Other', label: 'Other country', digits: 4, digitsMax: 15 },
]

// Sort alphabetically by label for the dropdown.
export const phoneCountries = [..._countries].sort((a, b) => a.label.localeCompare(b.label))
// Keep US first as the default.
const usIndex = phoneCountries.findIndex((c) => c.code === '+1')
if (usIndex > 0) {
  const [us] = phoneCountries.splice(usIndex, 1)
  phoneCountries.unshift(us)
}

// Pre-sorted by code length descending for fast prefix matching (done once at init).
const _byCodeLength = [...phoneCountries].filter(c => c.code).sort((a, b) => b.code.length - a.code.length)

// Detect country from a full phone string (already has +code prefix).
export function detectPhoneCode(phone) {
  if (!phone || !phone.trim()) return phoneCountries[0]
  for (const c of _byCodeLength) {
    if (phone.startsWith(c.code)) return c
  }
  return phoneCountries.find(c => c.name === 'Other') || phoneCountries[0]
}

// Validate phone: after stripping country code, digit count must be within allowed range.
export function isValidPhone(phone) {
  if (!phone || !phone.trim()) return false
  const trimmed = phone.trim()
  const country = detectPhoneCode(trimmed)
  const local = country.code
    ? trimmed.startsWith(country.code)
      ? trimmed.slice(country.code.length).trim()
      : trimmed
    : trimmed
  const digitCount = local.replace(/\D/g, '').length
  const max = country.digitsMax ?? (country.digits + 1)
  return digitCount >= country.digits - 1 && digitCount <= max
}

// Combine country code + raw input into display string.
export function combinePhone(code, localNumber) {
  if (!localNumber || !localNumber.trim()) return code
  return code ? `${code} ${localNumber.replace(/\D/g, '')}` : localNumber.replace(/\D/g, '')
}
