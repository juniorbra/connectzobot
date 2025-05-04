import { createClient } from '@supabase/supabase-js';

// Hardcoded values for testing
const supabaseUrl = 'https://csgmelptunreqningexs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZ21lbHB0dW5yZXFuaW5nZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDc3MzYsImV4cCI6MjA2MTcyMzczNn0.vQyS9kudZ6w9z6yQNPMMPFalgdPWo0wDWAur_4f_3CI';

// No need to check for environment variables since we're using hardcoded values
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
