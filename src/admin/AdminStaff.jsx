import { useState } from 'react'
import Modal from '../components/booking/Modal.jsx'
import { useAdminData } from './data.jsx'
import { Card, PageHeading, Initials, Field, fieldCls } from './ui.jsx'

function AddStaffModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('female')
  const [role, setRole] = useState('')

  const reset = () => {
    setName('')
    setGender('female')
    setRole('')
  }
  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name, gender, role: role || 'Therapist' })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-display text-xl font-semibold text-navy">Add staff member</h2>
          <p className="mt-1 text-sm text-slate-500">They'll be selectable in the booking flow.</p>
        </div>
        <div className="space-y-4 px-6 py-5">
          <Field label="Full name">
            <input
              className={fieldCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              autoFocus
            />
          </Field>
          <Field label="Gender">
            <div className="flex gap-2">
              {[
                { id: 'female', label: 'Female' },
                { id: 'male', label: 'Male' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    gender === g.id
                      ? 'border-teal bg-teal/5 text-teal'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Role / specialty">
            <input
              className={fieldCls}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Tui-Na & deep tissue"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-full bg-gradient-to-r from-navy to-teal px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
          >
            Add member
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function AdminStaff() {
  const { staff, addStaff, removeStaff, toggleStaff } = useAdminData()
  const [adding, setAdding] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)

  return (
    <div className="animate-step">
      <PageHeading
        title="Staff"
        subtitle={`${staff.filter((s) => s.active).length} active · ${staff.length} total`}
        action={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-navy to-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add staff
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {staff.map((m) => (
          <Card key={m.id} className={`p-5 ${m.active ? '' : 'opacity-60'}`}>
            <div className="flex items-start gap-3">
              <Initials name={m.name} className="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy">{m.name}</p>
                <p className="truncate text-sm text-slate-500">{m.role}</p>
                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-500">
                  {m.gender}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmRemove(m)}
                aria-label={`Remove ${m.name}`}
                className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M6 7h12M9 7V5h6v2M8 7l1 13h6l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-500">
                {m.active ? 'Bookable' : 'Hidden from booking'}
              </span>
              <button
                type="button"
                onClick={() => toggleStaff(m.id)}
                className={`text-sm font-semibold transition-colors ${
                  m.active ? 'text-slate-500 hover:text-navy' : 'text-teal hover:text-teal-600'
                }`}
              >
                {m.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <AddStaffModal open={adding} onClose={() => setAdding(false)} onAdd={addStaff} />

      {/* Remove confirmation */}
      <Modal open={!!confirmRemove} onClose={() => setConfirmRemove(null)}>
        {confirmRemove && (
          <div className="px-6 py-6">
            <h2 className="font-display text-xl font-semibold text-navy">
              Remove {confirmRemove.name}?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This removes them from the roster. You can also just deactivate them to
              keep their record but hide them from booking.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmRemove(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeStaff(confirmRemove.id)
                  setConfirmRemove(null)
                }}
                className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
