import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const cookies = req.cookies || cookie.parse(req.headers.cookie || '');
    const token = cookies.admin_token;

    if (!token) {
      return res.status(200).json({ authenticated: false });
    }

    const jwtSecret = (process.env.JWT_SECRET || '').trim();
    if (!jwtSecret) {
      console.error('[AUTH ERROR] Server missing auth secrets');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      jwt.verify(token, jwtSecret);
      return res.status(200).json({ authenticated: true });
    } catch {
      return res.status(200).json({ authenticated: false });
    }
  } catch {
    return res.status(200).json({ authenticated: false });
  }
}
