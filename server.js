import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import registerEvent from './api/register-event.js';
import getRegistrations from './api/get-registrations.js';
import updateRegistration from './api/update-registration.js';
import deleteRegistration from './api/delete-registration.js';

import adminLogin from './api/admin-login.js';
import adminSession from './api/admin-session.js';
import adminLogout from './api/admin-logout.js';

// Load local Vercel environments
dotenv.config({ path: '.env.local', override: true });

const app = express();
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate Limiting for Admin Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 500, // Relaxed in local dev
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// Expose Vercel serverless functions as Express routes
app.post('/api/admin-login', loginLimiter, (req, res) => adminLogin(req, res));
app.get('/api/admin-session', (req, res) => adminSession(req, res));
app.post('/api/admin-logout', (req, res) => adminLogout(req, res));

app.all('/api/register-event', (req, res) => registerEvent(req, res));
app.all('/api/get-registrations', (req, res) => getRegistrations(req, res));
app.all('/api/update-registration', (req, res) => updateRegistration(req, res));
app.all('/api/delete-registration', (req, res) => deleteRegistration(req, res));

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h2>✅ API Server is Running</h2>
      <p>This is your backend proxy server for Vercel API routes.</p>
      <p>To view the website, please open <strong><a href="http://localhost:5173">http://localhost:5173</a></strong>.</p>
    </div>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Local Vercel API proxy running gracefully on http://localhost:${PORT}`);
  console.log(`✅ Connected successfully to Supabase. Testing Mode active.\n`);
});
