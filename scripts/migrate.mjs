import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import fs from 'fs';

const supabaseUrl = 'https://qmnpwinlvewbnjbruril.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnB3aW5sdmV3Ym5qYnJ1cmlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg0Mjg5OSwiZXhwIjoyMDk0NDE4ODk5fQ.sstB1g-4tdFkmstcfj5xgpPidHFRHtYo7RqRTyw_Kn0';

const supabase = createClient(supabaseUrl, serviceKey, {
  realtime: { transport: ws },
});

async function migrate() {
  const sql = fs.readFileSync(process.argv[2], 'utf8');
  console.log(`Running migration: ${process.argv[2]}`);
  const { error } = await supabase.rpc('exec_sql', { sql_text: sql });
  if (error) {
    console.error('Migration error:', error.message);
    // Try direct REST
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ sql_text: sql }),
    });
    const result = await res.json();
    if (res.ok) console.log('Migration applied via REST');
    else console.error('REST error:', result);
  } else {
    console.log('Migration applied successfully');
  }
}

migrate().catch(console.error);
