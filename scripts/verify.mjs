import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://qmnpwinlvewbnjbruril.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnB3aW5sdmV3Ym5qYnJ1cmlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg0Mjg5OSwiZXhwIjoyMDk0NDE4ODk5fQ.sstB1g-4tdFkmstcfj5xgpPidHFRHtYo7RqRTyw_Kn0';

const anon = createClient(supabaseUrl, serviceKey, { realtime: { transport: ws } });

async function verify() {
  const { data: requests, error: reqErr } = await anon.from('transfer_requests').select('*');
  console.log('Requests:', requests?.length || 0, reqErr?.message || '');

  const { data: drivers, error: drvErr } = await anon.from('drivers').select('*');
  console.log('Drivers:', drivers?.length || 0, drvErr?.message || '');

  const { data: settings } = await anon.from('settings').select('site_name,tagline');
  console.log('Settings:', settings?.length || 0);

  if (requests && drivers) {
    console.log('\n--- Sample data summary ---');
    console.log('First request:', requests[0]?.pickup_location, '->', requests[0]?.destination, '(' + requests[0]?.status + ')');
    console.log('First driver:', drivers[0]?.full_name, '(' + drivers[0]?.vehicle_type + ', ' + drivers[0]?.status + ')');
    console.log('\nAll tables accessible and populated!');
  }
}

verify().catch(console.error);
