import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  'https://kvmxocesbknoosgrxsqi.supabase.co',
  process.env.SUPABASE_KEY
)