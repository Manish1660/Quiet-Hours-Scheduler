import mongoose from 'mongoose';
import StudyBlock from '../../models/StudyBlock';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

let isConnected = false;
async function dbConnect() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const blocks = await StudyBlock.find({ userId: session.user.id }).sort({ startTime: 1 });
        res.status(200).json(blocks);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blocks' });
      }
      break;

    case 'POST':
      try {
        const { startTime, endTime } = req.body;
        const newBlock = new StudyBlock({
          userId: session.user.id,
          userEmail: session.user.email,
          startTime,
          endTime,
        });
        await newBlock.save();
        res.status(201).json(newBlock);
      } catch (error) {
        res.status(400).json({ error: 'Failed to create block' });
      }
      break;

    case 'DELETE':
        try {
            const { id } = req.query;
            const deletedBlock = await StudyBlock.findOneAndDelete({ _id: id, userId: session.user.id });
            if (!deletedBlock) {
                return res.status(404).json({ error: 'Block not found or you do not have permission to delete it.' });
            }
            res.status(200).json({ message: 'Block deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete block' });
        }
        break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}