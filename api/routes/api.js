const express = require('express');
const { supabase } = require('../lib/supabaseClient');

const router = express.Router();

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

// Create a new booking
router.post('/bookings', async (req, res) => {
  try {
    const { p_customer_name, p_customer_phone, p_customer_email, p_booking_date, p_booking_time, p_duration_min, p_party, p_services_total, p_addons_total, p_tip, p_payment, p_note } = req.body;
    
    // Construct the direct database payload
    const payload = {
      customer_name: p_customer_name,
      customer_phone: p_customer_phone,
      customer_email: p_customer_email,
      booking_date: p_booking_date,
      booking_time: p_booking_time,
      duration_min: p_duration_min,
      party: p_party,
      services_total: p_services_total,
      addons_total: p_addons_total,
      tip: p_tip,
      payment: p_payment,
      note: p_note
    };

    // Direct insert! No RPC needed because the Service Role Key bypasses RLS
    const { data, error } = await supabase
      .from('bookings')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
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
