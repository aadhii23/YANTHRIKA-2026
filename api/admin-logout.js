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
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Clear cookie using SameSite=Lax (consistent with login)
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`);

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
