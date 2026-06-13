import { useEffect, useRef } from 'react'
import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import Pill from '../components/booking/Pill.jsx'
import SelectableCard from '../components/booking/SelectableCard.jsx'
import InfoBox from '../components/booking/InfoBox.jsx'
import BackButton from '../components/booking/BackButton.jsx'
import {
  categories,
  durations,
  addons,
  combos,
  comboOptions,
  getCategory,
  getCombo,
  bilingual,
  localName,
  detailLine,
  hasSelection,
} from '../data/catalog.js'

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  )
}

function Avatar({ text, primary }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
        primary ? 'bg-teal' : 'bg-navy'
      }`}
    >
      {text}
    </span>
  )
}

function Badge({ children, tone = 'teal' }) {
  const tones = {
    teal: 'bg-teal/10 text-teal',
    slate: 'bg-slate-100 text-slate-500',
  }
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

function RemoveButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function GuestEditor({ guest, name, avatar, primary, showHeader, showConfirm }) {
  const { t, lang } = useI18n()
  const {
    setMode,
    setCategory,
    setDuration,
    setPick,
    setCombo,
    updateSlot,
    toggleAddon,
    confirmGuest,
    removeGuest,
  } = useBooking()

  const sel = guest.selection
  if (!sel) return null
  const cat = getCategory(sel.categoryId)
  const desc = (item) => (lang === 'zh' ? item.descZh : item.descEn)

  return (
    <div className="space-y-7 rounded-2xl border-2 border-teal/30 bg-white p-4 sm:p-6">
      {showHeader && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Avatar text={avatar} primary={primary} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">{name}</p>
              <p className="truncate text-sm text-slate-500">
                {t('services.chooseService')}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge tone="teal">{t('services.inProgress')}</Badge>
            {!primary && (
              <RemoveButton onClick={() => removeGuest(guest.id)} label={name} />
            )}
          </div>
        </div>
      )}

      {/* Single / Combo toggle */}
      <div className="flex flex-wrap gap-2">
        <Pill active={sel.mode === 'single'} onClick={() => setMode(guest.id, 'single')}>
          {t('services.single')}
        </Pill>
        <Pill active={sel.mode === 'combo'} onClick={() => setMode(guest.id, 'combo')}>
          {t('services.combo')}
        </Pill>
      </div>

      {sel.mode === 'single' ? (
        <>
          <div>
            <SectionLabel>{t('services.category')}</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Pill
                  key={c.id}
                  active={sel.categoryId === c.id}
                  onClick={() => setCategory(guest.id, c.id)}
                >
                  {bilingual(c)}
                </Pill>
              ))}
            </div>
          </div>

          {cat?.type === 'duration' && (
            <div>
              <SectionLabel>{t('services.duration')}</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <Pill
                    key={d.id}
                    active={sel.durationId === d.id}
                    onClick={() => setDuration(guest.id, d.id)}
                  >
                    {d.pill} · ${d.price}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionLabel>
              {cat?.type === 'duration' ? t('services.technique') : t('services.service')}
            </SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              {(cat?.type === 'duration' ? cat.techniques : cat?.services ?? []).map(
                (item) => (
                  <SelectableCard
                    key={item.id}
                    selected={sel.pickId === item.id}
                    onClick={() => setPick(guest.id, item.id)}
                    title={localName(item, lang)}
                    desc={
                      cat.type === 'fixed'
                        ? `${desc(item)} · ${item.min} min`
                        : desc(item)
                    }
                    priceLabel={cat.type === 'fixed' ? `$${item.price}` : undefined}
                  />
                ),
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <SectionLabel>{t('services.comboSize')}</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {combos.map((c) => (
                <Pill
                  key={c.id}
                  active={sel.comboId === c.id}
                  onClick={() => setCombo(guest.id, c.id)}
                >
                  {c.nameEn} · ${c.price}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: getCombo(sel.comboId)?.slots ?? 0 }).map((_, i) => (
              <div key={i}>
                <SectionLabel>{t('services.slot', { n: i + 1 })}</SectionLabel>
                <select
                  value={sel.slots[i] ?? ''}
                  onChange={(e) => updateSlot(guest.id, i, e.target.value || null)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal"
                >
                  <option value="">{t('services.slotPlaceholder')}</option>
                  {comboOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {localName(o, lang)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add-ons (per guest) */}
      <div>
        <SectionLabel>{t('services.addons')}</SectionLabel>
        <p className="-mt-2 mb-3 text-sm text-slate-500">
          {t('services.addonsFor', { guest: name })}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {addons.map((a) => (
            <SelectableCard
              key={a.id}
              selected={sel.addonIds.includes(a.id)}
              onClick={() => toggleAddon(guest.id, a.id)}
              title={localName(a, lang)}
              desc={desc(a)}
              priceLabel={a.free ? t('services.free') : `+$${a.price}`}
              priceFree={a.free}
            />
          ))}
        </div>
      </div>

      {showConfirm && (
        <button
          type="button"
          disabled={!hasSelection(sel)}
          onClick={() => confirmGuest(guest.id)}
          className={`w-full rounded-full py-3.5 font-semibold text-white shadow-sm transition-all duration-200 ${
            hasSelection(sel)
              ? 'bg-teal hover:bg-teal-600 hover:shadow-md active:scale-[0.98]'
              : 'cursor-not-allowed bg-slate-300'
          }`}
        >
          {t('services.confirmGuest', { guest: name })}
        </button>
      )}
    </div>
  )
}

function DoneRow({ guest, name, avatar, primary }) {
  const { t, lang } = useI18n()
  const { editGuest, removeGuest } = useBooking()
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:gap-4">
      <Avatar text={avatar} primary={primary} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-navy">{name}</p>
        <p className="truncate text-sm text-slate-500">
          {detailLine(guest.selection, lang)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-medium text-teal sm:flex">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('services.done')}
        </span>
        <button
          type="button"
          onClick={() => editGuest(guest.id)}
          className="text-sm font-medium text-teal hover:underline"
        >
          {t('services.edit')}
        </button>
        {!primary && <RemoveButton onClick={() => removeGuest(guest.id)} label={name} />}
      </div>
    </div>
  )
}

function PendingRow({ guest, name, avatar, primary }) {
  const { t } = useI18n()
  const { activateGuest, removeGuest } = useBooking()
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 sm:gap-4">
      <button
        type="button"
        onClick={() => activateGuest(guest.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
      >
        <Avatar text={avatar} primary={primary} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{name}</p>
          <p className="truncate text-sm text-slate-500">{t('services.tapToChoose')}</p>
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-1.5">
        <Badge tone="slate">{t('services.notStarted')}</Badge>
        {!primary && <RemoveButton onClick={() => removeGuest(guest.id)} label={name} />}
      </div>
    </div>
  )
}

export default function ServicesStep() {
  const { guests, activeId } = useBooking()
  const { t } = useI18n()
  const single = guests.length === 1

  // When the active guest changes (e.g. after confirming one), bring the newly
  // opened editor into view so the next guest appears right where you are.
  const activeRef = useRef(null)
  const prevActive = useRef(activeId)
  useEffect(() => {
    if (prevActive.current !== activeId && activeId != null) {
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    prevActive.current = activeId
  }, [activeId])

  const nameOf = (g, i) =>
    g.primary ? t('guest.primaryName') : `${t('guest.label')} ${i + 1}`
  const avatarOf = (g, i) => (g.primary ? 'Y' : `G${i + 1}`)

  // With one guest the box has no header, so the lead introduces the step.
  // With several, each box carries its own header label, so the lead would
  // just repeat the guest's name — drop it.
  const activeIndex = guests.findIndex((g) => g.id === activeId)
  const showLead = single
  const activeName = activeIndex >= 0 ? nameOf(guests[activeIndex], activeIndex) : ''

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
        {t('services.title')}{' '}
        <span className="text-xl font-normal text-slate-400 sm:text-2xl">
          {t('services.titleAlt')}
        </span>
      </h1>
      {showLead && (
        <p className="mt-3 text-slate-600">
          {t('services.lead', { guest: activeName })}
        </p>
      )}

      <div className="mt-7 space-y-4">
        {guests.map((guest, i) => {
          const name = nameOf(guest, i)
          const avatar = avatarOf(guest, i)

          if (guest.id === activeId) {
            return (
              <div key={guest.id} ref={activeRef} className="scroll-mt-6">
                <GuestEditor
                  guest={guest}
                  name={name}
                  avatar={avatar}
                  primary={guest.primary}
                  showHeader={!single}
                  showConfirm={!single}
                />
              </div>
            )
          }
          if (guest.confirmed) {
            return (
              <DoneRow key={guest.id} guest={guest} name={name} avatar={avatar} primary={guest.primary} />
            )
          }
          return (
            <PendingRow key={guest.id} guest={guest} name={name} avatar={avatar} primary={guest.primary} />
          )
        })}
      </div>

      <div className="mt-6">
        <InfoBox>{t('services.promo')}</InfoBox>
      </div>

      <BackButton />
    </div>
  )
}
