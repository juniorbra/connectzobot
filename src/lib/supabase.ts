import { createClient } from '@supabase/supabase-js';

// Hardcoded values for testing
const supabaseUrl = 'https://oovwvznxynyzqwjkvoxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdnd2em54eW55enF3amt2b3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Nzk3MjUsImV4cCI6MjA2MTQ1NTcyNX0.wBtJm5I8-TUyTbcWsx0tG4IDIsnmzyV_afKMNCm-oVM';

// Fallback to environment variables if available
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oovwvznxynyzqwjkvoxn.supabase.co';
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdnd2em54eW55enF3amt2b3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Nzk3MjUsImV4cCI6MjA2MTQ1NTcyNX0.wBtJm5I8-TUyTbcWsx0tG4IDIsnmzyV_afKMNCm-oVM';

// No need to check for environment variables since we're using hardcoded values
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
