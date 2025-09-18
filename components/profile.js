// components/Profile.js
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';

export default function Profile() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (session?.user) {
      setProfile(session.user);
    }
  }, [session]);

  return (
    <div>
      <h2>Welcome, {profile?.email}</h2>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  );
}
