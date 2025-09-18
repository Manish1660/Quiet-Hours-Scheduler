// components/Auth.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else alert('Check your email for the login link!')
    setLoading(false)
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) alert(error.message)
  }

  return (
    <div className="p-4 border rounded-lg max-w-sm mx-auto">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Sign in with Email'}
        </button>
      </form>

      <hr className="my-4" />

      <button
        onClick={signInWithGoogle}
        className="bg-red-500 text-white px-4 py-2 rounded w-full"
      >
        Continue with Google
      </button>
    </div>
  )
}
