// pages/api/send-email.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { to } = req.body; // 👈 take recipient from frontend
    const data = await resend.emails.send({
      from: 'reminder@yourdomain.com', // replace with verified sender
      to,
      subject: '⏰ Test Reminder',
      html: `<p>Hey ${to}, this is your reminder 🚀</p>`,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: error.message });
  }
}
