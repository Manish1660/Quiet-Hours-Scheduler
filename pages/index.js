// pages/index.js
import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function Home() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [message, setMessage] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [reminders, setReminders] = useState([]);

  // 🔄 Load reminders
  useEffect(() => {
    if (!session) return;

    const fetchReminders = async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('remind_at', { ascending: true });

      if (!error) setReminders(data);
    };

    fetchReminders();
  }, [session, supabase]);

  // ➕ Add reminder
  const createReminder = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('reminders').insert({
      user_id: session.user.id,
      email: session.user.email,
      message,
      remind_at: remindAt,
    });
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('✅ Reminder scheduled!');
      setMessage('');
      setRemindAt('');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      {!session ? (
        <>
          <h1>Quiet Hours Scheduler</h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
        </>
      ) : (
        <>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Welcome, {session.user.email}</h2>
            <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </header>

          <main>
            <h3>Schedule a Reminder</h3>
            <form onSubmit={createReminder} style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Message</label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Remind At</label>
                <input
                  type="datetime-local"
                  value={remindAt}
                  onChange={(e) => setRemindAt(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
                />
              </div>
              <button type="submit">Add Reminder</button>
            </form>

            <h3>Your Reminders</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {reminders.length === 0 ? (
                <p>No reminders yet.</p>
              ) : (
                reminders.map((r) => (
                  <li key={r.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
                    <p><strong>{r.message}</strong></p>
                    <p>⏰ {new Date(r.remind_at).toLocaleString()}</p>
                    <p>Status: {r.sent ? '✅ Sent' : '⌛ Pending'}</p>
                  </li>
                ))
              )}
            </ul>
          </main>
        </>
      )}
    </div>
  );
}
