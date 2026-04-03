import jwt from 'jsonwebtoken';
import cookie from 'cookie';

function setCorsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers.origin || (process.env.NODE_ENV === 'production' ? 'https://yanthrika2026.vercel.app' : 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    } catch (err) {
      // Token expired or invalid
      return res.status(200).json({ authenticated: false });
    }
  } catch (err) {
    return res.status(200).json({ authenticated: false });
  }
}
