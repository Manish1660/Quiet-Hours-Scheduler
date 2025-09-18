// pages/api/send-reminders.js
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ service role (not anon key!)
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests allowed' });
  }

  try {
    // 1. Get due reminders
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('sent', false)
      .lte('remind_at', new Date().toISOString());

    if (error) throw error;

    // 2. Send emails for each due reminder
    for (const r of reminders) {
      await resend.emails.send({
        from: 'reminder@yourdomain.com',
        to: r.email,
        subject: '⏰ Reminder',
        html: `<p>${r.message}</p>`,
      });

      // 3. Mark reminder as sent
      await supabase.from('reminders').update({ sent: true }).eq('id', r.id);
    }

    return res.status(200).json({ success: true, count: reminders.length });
  } catch (err) {
    console.error('Reminder error:', err);
    return res.status(500).json({ error: err.message });
  }
}
