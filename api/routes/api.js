const express = require('express');
const { supabase } = require('../lib/supabaseClient');

const router = express.Router();

// ── AVAILABILITY ──────────────────────────────────────────────────────────

async function getAvailabilityData(date, durationMin, gender = null) {
  // Convert date string → day-of-week key (sun/mon/…)
  const d = new Date(date + 'T12:00:00'); // noon avoids DST edge cases
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKey = DAY_KEYS[d.getDay()];

  // Fetch hours, closure check, and active staff in parallel
  const [hoursRes, closureRes, staffRes] = await Promise.all([
    supabase.from('business_hours').select('*').eq('day', dayKey).single(),
    supabase.from('closures').select('date').eq('date', date).maybeSingle(),
    supabase.from('staff').select('*').eq('active', true),
  ]);

  if (hoursRes.error && hoursRes.error.code !== 'PGRST116') throw hoursRes.error;
  if (staffRes.error) throw staffRes.error;
  const hours = hoursRes.data;

  // Closed day or closure date
  if (!hours?.open || closureRes.data) {
    return { closed: true, slots: [], unavailable: [], availableCount: {}, therapistSlots: {}, staff: [], therapistFreeSlotCount: {} };
  }

  // Parse "HH:MM" or "HH:MM:SS" → minutes from midnight
  const parseTime = (t) => {
    const parts = String(t || '0').split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  const openMin = parseTime(hours.start_time);
  const closeMin = parseTime(hours.end_time);

  // Format minutes → "H:MM AM/PM"
  const fmt = (mins) => {
    let h = Math.floor(mins / 60);
    const m = mins % 60;
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, '0')} ${ap}`;
  };

  // Generate candidate slots (same step logic as frontend timeSlotsFor)
  const step = Math.max(30, durationMin);
  const slots = [];
  for (let t = openMin; t + durationMin <= closeMin; t += step) {
    slots.push({ time: fmt(t), mins: t });
  }

  // Fetch all non-cancelled bookings for this date
  const { data: bookings, error: bErr } = await supabase
    .from('bookings')
    .select('booking_time, duration_min, therapist_id')
    .eq('booking_date', date)
    .neq('status', 'cancelled');
  if (bErr) throw bErr;

  // Parse "10:00 AM" → minutes from midnight
  const parseAmPm = (str) => {
    if (!str) return null;
    const [time, ap] = str.trim().split(' ');
    const [h, m] = time.split(':').map(Number);
    return ((h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + m;
  };

  // Build per-therapist blocked windows from existing bookings
  let activeStaff = staffRes.data || [];
  if (gender) {
    activeStaff = activeStaff.filter(s => s.gender === gender);
  }
  const allTherapistIds = activeStaff.map((s) => s.id);
  const therapistBlocked = Object.fromEntries(allTherapistIds.map((id) => [id, []]));

  for (const b of bookings || []) {
    if (!b.therapist_id || !therapistBlocked[b.therapist_id]) continue;
    const startMin = parseAmPm(b.booking_time);
    if (startMin === null) continue;
    therapistBlocked[b.therapist_id].push({
      start: startMin,
      end: startMin + (b.duration_min || durationMin),
    });
  }

  // For each slot: compute per-therapist availability and free count
  const therapistSlots = Object.fromEntries(allTherapistIds.map((id) => [id, { unavailable: [] }]));
  const availableCount = {};
  const therapistFreeSlotCount = Object.fromEntries(allTherapistIds.map((id) => [id, 0]));

  for (const slot of slots) {
    const slotEnd = slot.mins + durationMin;
    let freeCount = 0;

    for (const tid of allTherapistIds) {
      const blocked = therapistBlocked[tid].some((w) => w.start < slotEnd && w.end > slot.mins);
      if (!blocked) {
        freeCount++;
        therapistFreeSlotCount[tid]++;
      } else {
        therapistSlots[tid].unavailable.push(slot.time);
      }
    }

    // Subtract generic bookings (no preference) from freeCount
    let genericOverlap = 0;
    for (const b of bookings || []) {
      if (!b.therapist_id) {
        const startMin = parseAmPm(b.booking_time);
        if (startMin !== null) {
          const endMin = startMin + (b.duration_min || durationMin);
          if (startMin < slotEnd && endMin > slot.mins) {
            genericOverlap++;
          }
        }
      }
    }

    availableCount[slot.time] = Math.max(0, freeCount - genericOverlap);
  }

  return { closed: false, slots: slots.map(s => s.time), availableCount, therapistSlots, staff: activeStaff, therapistFreeSlotCount };
}

// GET /api/availability?date=YYYY-MM-DD&duration=60&therapistId=th_david&gender=female
router.get('/availability', async (req, res) => {
  try {
    const { date, duration, therapistId, gender } = req.query;
    const durationMin = parseInt(duration) || 60;

    const data = await getAvailabilityData(date, durationMin, gender);

    if (data.closed) {
      return res.json({ closed: true, slots: [], unavailable: [], availableCount: {}, therapistSlots: {} });
    }

    // Unavailable list depends on whether a specific therapist was requested
    const unavailable = therapistId
      ? data.therapistSlots[therapistId]?.unavailable || []
      : data.slots.filter((time) => data.availableCount[time] === 0);

    res.json({
      closed: false,
      slots: data.slots,
      unavailable,
      availableCount: data.availableCount,
      therapistSlots: data.therapistSlots,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────────

// Get active staff
router.get('/staff', async (req, res) => {
  try {
    const { data, error } = await supabase.from('staff').select('*').eq('active', true);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new booking(s) (supports single booking or array of bookings for multiple guests)
router.post('/bookings', async (req, res) => {
  try {
    const body = req.body;
    let bookingsToInsert = [];

    if (Array.isArray(body)) {
      bookingsToInsert = body;
    } else if (body.bookings && Array.isArray(body.bookings)) {
      bookingsToInsert = body.bookings;
    } else {
      bookingsToInsert = [body];
    }

    // Parse "10:00 AM" → minutes from midnight
    const parseAmPm = (str) => {
      if (!str) return null;
      const [time, ap] = str.trim().split(' ');
      const [h, m] = time.split(':').map(Number);
      return ((h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + m;
    };

    // Track slots assigned during this request to prevent double-booking guests in the same party
    const localBlocked = {};
    const isLocallyBlocked = (tid, date, startMin, endMin) => {
      if (!localBlocked[tid]) return false;
      return localBlocked[tid].some(w => w.date === date && w.start < endMin && w.end > startMin);
    };

    // Validate availability and auto-assign therapist for each booking
    for (let guestIndex = 0; guestIndex < bookingsToInsert.length; guestIndex++) {
      const b = bookingsToInsert[guestIndex];
      const date = b.p_booking_date ?? b.booking_date;
      const time = b.p_booking_time ?? b.booking_time;
      const durationMin = b.p_duration_min ?? b.duration_min;
      let reqTherapistId = b.p_therapist_id ?? b.therapist_id ?? null;
      const guestLabel = `Guest ${guestIndex + 1}`;

      const partyArray = b.p_party ?? b.party;
      const requestedLabel = partyArray && partyArray[0] && partyArray[0].therapist ? partyArray[0].therapist : null;
      const genderFilter = requestedLabel === 'female' || requestedLabel === 'male' ? requestedLabel : null;
      const data = await getAvailabilityData(date, durationMin, genderFilter);

      const startMin = parseAmPm(time);
      if (startMin === null || data.closed || !data.slots.includes(time)) {
        return res.status(409).json({
          error: 'SLOT_UNAVAILABLE',
          guestIndex,
          time,
          detail: `${guestLabel}: ${time || 'time'} is not available on this date.`,
        });
      }
      const endMin = startMin + durationMin;

      if (reqTherapistId) {
        const therapistUnavail = data.therapistSlots[reqTherapistId]?.unavailable || [];
        if (therapistUnavail.includes(time) || isLocallyBlocked(reqTherapistId, date, startMin, endMin)) {
          const therapistName = data.staff.find((s) => s.id === reqTherapistId)?.name
          return res.status(409).json({
            error: 'SLOT_UNAVAILABLE',
            guestIndex,
            time,
            detail: therapistName
              ? `${guestLabel}: ${therapistName} was just booked at ${time}. Please choose another time or therapist.`
              : `${guestLabel}: the selected therapist was just booked at ${time}. Please choose another time or therapist.`,
          });
        }
      } else {
        let candidates = data.staff.filter(s =>
          !data.therapistSlots[s.id]?.unavailable.includes(time) && !isLocallyBlocked(s.id, date, startMin, endMin)
        );

        if (genderFilter) {
          candidates = candidates.filter(s => s.gender === genderFilter);
        }

        if (candidates.length === 0) {
          const poolLabel = genderFilter ? `${genderFilter} therapist` : 'therapist';
          return res.status(409).json({
            error: 'SLOT_UNAVAILABLE',
            guestIndex,
            time,
            detail: `${guestLabel}: this time was just booked, so no ${poolLabel} is available at ${time}. Please pick another time.`,
          });
        }

        candidates.sort((a, b) => data.therapistFreeSlotCount[b.id] - data.therapistFreeSlotCount[a.id]);
        reqTherapistId = candidates[0].id;

        if (b.p_therapist_id !== undefined) b.p_therapist_id = reqTherapistId;
        else b.therapist_id = reqTherapistId;

        if (partyArray && partyArray.length > 0) {
          partyArray[0].therapist = candidates[0].name;
        }
      }

      // Record this assignment locally so the next guest in the loop doesn't double-book them
      if (!localBlocked[reqTherapistId]) localBlocked[reqTherapistId] = [];
      localBlocked[reqTherapistId].push({ date, start: startMin, end: endMin });
    }

    const payloads = bookingsToInsert.map(b => ({
      customer_name: b.p_customer_name ?? b.customer_name,
      customer_phone: b.p_customer_phone ?? b.customer_phone,
      customer_email: b.p_customer_email ?? b.customer_email ?? '',
      booking_date: b.p_booking_date ?? b.booking_date,
      booking_time: b.p_booking_time ?? b.booking_time,
      duration_min: b.p_duration_min ?? b.duration_min,
      party: b.p_party ?? b.party,
      services_total: b.p_services_total ?? b.services_total,
      addons_total: b.p_addons_total ?? b.addons_total,
      tip: b.p_tip ?? b.tip,
      payment: b.p_payment ?? b.payment,
      note: b.p_note ?? b.note ?? '',
      therapist_id: b.p_therapist_id ?? b.therapist_id ?? null,
      booking_group_id: b.p_booking_group_id ?? b.booking_group_id ?? null,
    }));

    const { data, error } = await supabase
      .from('bookings')
      .insert(payloads)
      .select();

    if (error) throw error;
    
    // Return array if input was array, else single item
    res.json({ data: (Array.isArray(body) || (body.bookings && Array.isArray(body.bookings))) ? data : (data?.[0] || data) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── ADMIN ROUTES ──────────────────────────────────────────────────────────

// Get all admin dashboard data
router.get('/admin/data', async (req, res) => {
  try {
    const [bookingsRes, staffRes, hoursRes, closuresRes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('staff').select('*'),
      supabase.from('business_hours').select('*'),
      supabase.from('closures').select('date'),
    ]);

    res.json({
      bookings: bookingsRes.data || [],
      staff: staffRes.data || [],
      hours: hoursRes.data || [],
      closures: closuresRes.data || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status
router.put('/admin/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add staff
router.post('/admin/staff', async (req, res) => {
  try {
    const { id, name, gender, role, active } = req.body;
    const { error } = await supabase.from('staff').insert([{ id, name, gender, role, active }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove staff
router.delete('/admin/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle staff active status
router.put('/admin/staff/:id/active', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const { error } = await supabase.from('staff').update({ active }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update staff details
router.put('/admin/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, role } = req.body;
    const { error } = await supabase.from('staff').update({ name, gender, role }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update day open status
router.put('/admin/hours/:day/open', async (req, res) => {
  try {
    const { day } = req.params;
    const { open } = req.body;
    const { error } = await supabase.from('business_hours').update({ open }).eq('day', day);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update day hours (start_time or end_time)
router.put('/admin/hours/:day/:field', async (req, res) => {
  try {
    const { day, field } = req.params;
    const { value } = req.body;
    const column = field === 'start' ? 'start_time' : field === 'end' ? 'end_time' : field;

    if (column !== 'start_time' && column !== 'end_time') {
      return res.status(400).json({ error: 'INVALID_FIELD', detail: 'Only start and end times can be updated.' });
    }

    const { data: currentHours, error: hoursError } = await supabase
      .from('business_hours')
      .select('start_time, end_time')
      .eq('day', day)
      .single();

    if (hoursError) throw hoursError;

    const parseTime = (t) => {
      const parts = String(t || '0').split(':');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };

    const nextStart = column === 'start_time' ? value : currentHours.start_time;
    const nextEnd = column === 'end_time' ? value : currentHours.end_time;

    if (nextStart && nextEnd && parseTime(nextStart) >= parseTime(nextEnd)) {
      return res.status(400).json({
        error: 'INVALID_HOURS_RANGE',
        detail: 'Opening time must be earlier than closing time.',
      });
    }

    const { error } = await supabase.from('business_hours').update({ [column]: value }).eq('day', day);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add closure
router.post('/admin/closures', async (req, res) => {
  try {
    const { date } = req.body;
    const { error } = await supabase.from('closures').insert([{ date }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove closure
router.delete('/admin/closures/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { error } = await supabase.from('closures').delete().eq('date', date);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
