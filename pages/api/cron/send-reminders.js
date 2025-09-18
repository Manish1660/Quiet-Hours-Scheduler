import mongoose from 'mongoose';
import StudyBlock from '../../../models/StudyBlock';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

let isConnected = false;
async function dbConnect() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

export default async function handler(req, res) {
  const { cron_secret } = req.query;
  if (cron_secret !== process.env.CRON_SECRET) {
    console.warn('Unauthorized CRON job attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();
  
  const now = new Date();
  const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
  const elevenMinutesFromNow = new Date(now.getTime() + 11 * 60 * 1000);

  const upcomingBlocks = await StudyBlock.find({
    startTime: {
      $gte: tenMinutesFromNow,
      $lt: elevenMinutesFromNow,
    },
    notificationSent: false,
  });

  if (upcomingBlocks.length === 0) {
    console.log('CRON job ran: No upcoming blocks to notify.');
    return res.status(200).json({ message: 'No upcoming blocks to notify.' });
  }

  const promises = upcomingBlocks.map(async (block) => {
    try {
      await resend.emails.send({
        from: `Reminder <${process.env.RESEND_FROM_EMAIL}>`,
        to: [block.userEmail],
        subject: '🔔 Your Quiet Hours session is starting in 10 minutes!',
        html: `<p>Hi there,</p><p>Just a friendly reminder that your scheduled study session starts at ${new Date(block.startTime).toLocaleTimeString()}.</p><p>Happy focusing!</p>`,
      });

      block.notificationSent = true;
      await block.save();
      console.log(`Notification sent for block ${block._id} to ${block.userEmail}`);
    } catch (error) {
      console.error(`Failed to send email for block ${block._id}:`, error);
    }
  });

  await Promise.all(promises);

  res.status(200).json({ message: `Processed ${upcomingBlocks.length} notifications.` });
}