import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@voxi/types'

// For server components, route handlers and server actions. The session lives
// in cookies; RLS does the authorisation, so there is no API layer here that
// only forwards queries.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database, 'voxi'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      db: { schema: 'voxi' },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Middleware refreshes the session, so this is safe to swallow.
          }
        },
      },
    }
  )
}
