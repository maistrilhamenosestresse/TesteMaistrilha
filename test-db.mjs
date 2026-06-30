import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2].trim();
  return acc;
}, {});

const supabase = createClient(envConfig['NEXT_PUBLIC_SUPABASE_URL'], envConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function run() {
  const { data, error } = await supabase.from('settings').select('*');
  console.log('Data:', data);
  console.log('Error:', error);
}
run();
