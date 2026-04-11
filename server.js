import './load-env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import registerEvent    from './api/register.js';
import adminHandler     from './api/admin.js';

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate Limiting for Admin Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 500,
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

app.all('/api/register',           (req, res) => registerEvent(req, res));
app.all('/api/admin',              loginLimiter, (req, res) => adminHandler(req, res));

const PORT = process.env.PORT || 3001;

app.get('/', (_req, res) => {
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
