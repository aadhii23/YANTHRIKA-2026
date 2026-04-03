import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export function verifyAuth(req) {
  try {
    const jwtSecret = (process.env.JWT_SECRET || '').trim();
    if (!jwtSecret) {
      console.error('[AUTH] JWT_SECRET is missing');
      return false;
    }
    console.log('[DEBUG] Verify Secret Length:', jwtSecret.length);
    
    try {
      // Support both raw req.headers.cookie and Express req.cookies
      const cookies = req.cookies || cookie.parse(req.headers.cookie || '');
      const token = cookies.admin_token;
      
      console.log('[DEBUG] verifyAuth check:', { 
        hasReqCookies: !!req.cookies, 
        hasCookieHeader: !!req.headers.cookie,
        tokenFound: !!token 
      });
      
      if (!token) {
        console.log('[AUTH] No token found. Cookies keys:', Object.keys(cookies || {}));
        return false;
      }

      jwt.verify(token, jwtSecret);
      return true;
    } catch (jwtErr) {
      console.error('[AUTH] JWT Verification failed:', jwtErr.message);
      return false;
    }
  } catch (err) {
    console.error('[AUTH] verifyAuth error:', err);
    return false;
  }
}
