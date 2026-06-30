process.env.TZ = 'America/New_York'
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const paymentRoutes = require('./routes/payment');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount the API routes
app.use('/api', apiRoutes);

// Payment endpoint
app.post('/api/payments/create', paymentRoutes.handleCreatePayment);

// Notification scheduler (for reminder + follow-up emails)
app.use('/api/cron', notificationRoutes);

// Notification scheduler — fires every hour at :00 past the hour,
// regardless of when the server was started/restarted.
const NOTIFY_URL = process.env.NOTIFY_URL || `http://localhost:${PORT}/api/cron/notifications`
async function runCron() {
  try {
    const res = await fetch(NOTIFY_URL)
    const data = await res.json()
    if (data.reminders || data.followups) {
      console.log(`Cron: ${data.reminders} reminders + ${data.followups} follow-ups sent`)
    }
  } catch (err) { console.error('Cron self-fetch failed:', err.message) }
}
// Fires every hour at :00
const TARGET_MINUTE = 0
const now = new Date()
const currentMin = now.getMinutes()
const currentSec = now.getSeconds()
const currentMs = now.getMilliseconds()
// ms already elapsed in the current hour
const msPastHour = (currentMin * 60 + currentSec) * 1000 + currentMs
// ms to the target minute mark within the current hour
const msToTarget = (TARGET_MINUTE * 60 * 1000) - msPastHour
// if we already passed :07 this hour, wait until next hour's :07
const msToFirstRun = msToTarget > 0 ? msToTarget : msToTarget + 3600000
console.log(`Cron scheduled: first run in ${Math.round(msToFirstRun / 1000)}s (at :${String(TARGET_MINUTE).padStart(2,'0')} each hour)`)
setTimeout(() => {
  runCron()
  setInterval(runCron, 3600000)
}, msToFirstRun)

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running successfully' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
