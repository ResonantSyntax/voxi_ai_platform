import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@voxi/types'

// Voxi lives in the `voxi` schema, not `public`. Without db.schema every query
// 404s, and the schema must also be listed under Settings > API > Exposed
// schemas (migration 20260901000002 does that).
export function createClient() {
  return createBrowserClient<Database, 'voxi'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { db: { schema: 'voxi' } }
  )
}
