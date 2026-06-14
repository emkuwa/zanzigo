#!/usr/bin/env node

/**
 * ZanziGo Database Setup Script
 *
 * Tries multiple approaches to create the database tables:
 * 1. Direct PostgreSQL connection (via pg module)
 * 2. Supabase Management API (via personal access token)
 * 3. Falls back to printing SQL for manual execution
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Load env
function loadEnv() {
  const envPath = resolve(projectRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local not found. Create it first.');
    process.exit(1);
  }
  const env = {};
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

async function main() {
  console.log('\n🔧 ZanziGo Database Setup\n');

  const sql = readFileSync(resolve(projectRoot, 'supabase/migrations/00001_initial_schema.sql'), 'utf-8');

  // Method 1: Try direct PostgreSQL connection
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    console.log('📦 Attempting direct database connection...');
    try {
      const { default: pg } = await import('pg');
      const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
      await pool.query(sql);
      console.log('✅ Tables created successfully via direct database connection!');
      await pool.end();
      return;
    } catch (err) {
      console.log(`  ⚠️ Direct connection failed: ${err.message.slice(0, 80)}`);
    }
  }

  // Method 2: Try Supabase Management API
  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const projectRef = supabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

  if (projectRef && process.env.SUPABASE_ACCESS_TOKEN) {
    console.log('🔑 Attempting Supabase Management API...');
    try {
      const r = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      if (r.ok) {
        console.log('✅ Tables created successfully via Management API!');
        return;
      }
      console.log(`  ⚠️ Management API failed: ${await r.text().then(t => t.slice(0, 80))}`);
    } catch (err) {
      console.log(`  ⚠️ Management API error: ${err.message}`);
    }
  } else {
    console.log('  ⏭️ Skipping Management API (SUPABASE_ACCESS_TOKEN not set)');
  }

  // Method 3: Print SQL for manual execution
  console.log('\n⚠️  Could not create tables automatically.');
  console.log('\n📋 To set up the database manually:');
  console.log('  1. Go to https://supabase.com/dashboard');
  console.log('  2. Select your project or create a new one');
  console.log('  3. Open the SQL Editor');
  console.log(`  4. Copy and paste the contents of:`);
  console.log(`     supabase/migrations/00001_initial_schema.sql`);
  console.log('  5. Run the SQL\n');

  // Method 4: Try Supabase client with service role key as last resort
  if (supabaseUrl && anonKey) {
    console.log('🔄 Attempting to check if tables already exist...');
    const supabase = createClient(supabaseUrl, anonKey);
    const { data } = await supabase.from('transfer_requests').select('id').limit(1).maybeSingle();
    if (data) {
      console.log('✅ Tables already exist!');
      return;
    }
    const { data: d } = await supabase.from('drivers').select('id').limit(1).maybeSingle();
    if (d) {
      console.log('✅ Tables already exist!');
      return;
    }
    console.log('  ⚠️ Tables do not exist yet. Please run the SQL manually.');
  }
}

main().catch(console.error);
