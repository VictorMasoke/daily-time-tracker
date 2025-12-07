import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient('https://cofrtthaxyucttqzvnqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZnJ0dGhheHl1Y3R0cXp2bnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMjIwMTYsImV4cCI6MjA3OTY5ODAxNn0.0wRXSAT6iHtOZ3CEXW8IjUK7jVc3r3QCFnEK8Xy0Ccw', {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
