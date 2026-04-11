import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { setEventStatus } from './event-state.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const cookies = req.cookies || cookie.parse(req.headers.cookie || '');
    const token = cookies.admin_token;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, (process.env.JWT_SECRET || '').trim());

    const { event_name, is_open } = req.body;
    await setEventStatus(event_name, is_open);

    return res.status(200).json({ success: true });

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('toggle-event error:', err);
    return res.status(500).json({ error: 'Failed to update event status' });
  }
}
