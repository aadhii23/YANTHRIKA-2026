import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function setCorsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers.origin || (process.env.NODE_ENV === 'production' ? 'https://yanthrika2026.vercel.app' : 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    let { username, password } = req.body;
    
    // Basic validation / sanitization
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    
    username = String(username).trim();
    password = String(password);

    const expectedUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
    const hash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
    const jwtSecret = (process.env.JWT_SECRET || '').trim();

    if (!hash || !jwtSecret) {
      console.error('[AUTH ERROR] Server missing auth secrets');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    console.log('[DEBUG] Login Secret Length:', jwtSecret.length);

    if (username !== expectedUsername) {
      console.log(`[AUTH] Failed login attempt: unknown username "${username}"`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, hash);

    if (!isValid) {
      console.log(`[AUTH] Failed login attempt: invalid password for "${username}"`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Success - Issue JWT
    const token = jwt.sign({ admin: true }, jwtSecret, { expiresIn: '10m' });

    // Set HTTP-only secure cookie
    // Use SameSite=Lax for better compatibility with local proxies
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${isProd ? '; Secure' : ''}`);

    console.log(`[AUTH] Successful login for "${username}"`);
    return res.status(200).json({ success: true, message: 'Logged in successfully' });

  } catch (error) {
    console.error('[AUTH ERROR]', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
