import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oovwvznxynyzqwjkvoxn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdnd2em54eW55enF3amt2b3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Nzk3MjUsImV4cCI6MjA2MTQ1NTcyNX0.wBtJm5I8-TUyTbcWsx0tG4IDIsnmzyV_afKMNCm-oVM';

// Check for environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
