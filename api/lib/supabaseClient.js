require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;



if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in the .env file');
}

// Server-side client: persistSession: false ensures the service role JWT
// is always sent as the Authorization header, never replaced by a user session.
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase };
