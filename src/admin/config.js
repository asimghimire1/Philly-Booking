// ⚠️  PLACEHOLDER ACCESS CONTROL — NOT REAL SECURITY  ⚠️
// ---------------------------------------------------------------------------
// Everything in this file ships inside the browser bundle and can be read by
// anyone who opens DevTools. This only keeps out casual visitors. Before going
// live with real customer data, replace the auth adapter (see auth.jsx →
// `signInAdapter`) with a real provider — Supabase, Clerk, or your own backend —
// so credentials are verified SERVER-SIDE and booking data is only sent to
// authenticated admins.
//
// To change the demo login without committing it to git, create a `.env.local`:
//   VITE_ADMIN_EMAIL=you@painawayphilly.com
//   VITE_ADMIN_PASSWORD=something-long
// (Note: Vite still inlines VITE_* vars into the build, so this is convenience,
// not security.)
// ---------------------------------------------------------------------------

const ENV = import.meta.env

export const ADMIN_USERS = [
  {
    email: ENV.VITE_ADMIN_EMAIL || 'admin@painawayphilly.com',
    password: ENV.VITE_ADMIN_PASSWORD || 'painaway2026',
    name: 'Practice Admin',
  },
]
