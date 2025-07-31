import { createClient } from '@supabase/supabase-js';

// Replace these with YOUR actual Supabase project URL and Anon Key
const supabaseUrl = 'https://vyzcooyofvzycbhpaubk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5emNvb3lvZnZ6eWNiaHBhdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzODYwMTcsImV4cCI6MjA2MDk2MjAxN30.AY98Nd2RU7ILp_i9-CRPSM3thue1JOVzaFUXYOb7fBk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
