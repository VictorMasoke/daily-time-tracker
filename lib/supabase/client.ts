import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  const supabaseUrl = 'https://cofrtthaxyucttqzvnqi.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZnJ0dGhheHl1Y3R0cXp2bnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjIwMTYsImV4cCI6MjA3OTY5ODAxNn0.0wRXSAT6iHtOZ3CEXW8IjUK7jVc3r3QCFnEK8Xy0Ccw';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
