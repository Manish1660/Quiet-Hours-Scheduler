// pages/_app.js
import { supabase } from '../lib/supabaseClient'
import { useState } from 'react'

function MyApp({ Component, pageProps }) {
  // Optionally keep Supabase client in state
  const [client] = useState(() => supabase)

  return <Component {...pageProps} supabase={client} />
}

export default MyApp
