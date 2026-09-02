import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@voxi/types'

// detectSessionInUrl is false because React Native has no URL to read the
// session back out of; deep-link auth is handled explicitly instead.
export const supabase = createClient<Database, 'voxi'>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    db: { schema: 'voxi' },
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
