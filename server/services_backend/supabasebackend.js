// 📁 services_backend/supabasebackend.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vyzcooyofvzycbhpaubk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5emNvb3lvZnZ6eWNiaHBhdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzODYwMTcsImV4cCI6MjA2MDk2MjAxN30.AY98Nd2RU7ILp_i9-CRPSM3thue1JOVzaFUXYOb7fBk'
);

export { supabase };
