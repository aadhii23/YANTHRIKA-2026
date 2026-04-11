import adminLogin         from './_handlers/admin-login.js';
import adminLogout        from './_handlers/admin-logout.js';
import adminSession       from './_handlers/admin-session.js';
import getRegistrations   from './_handlers/get-registrations.js';
import deleteRegistration from './_handlers/delete-registration.js';
import updateRegistration from './_handlers/update-registration.js';
import toggleEvent        from './_handlers/toggle-event.js';
import getEventStatus     from './_handlers/get-event-status.js';

function setCorsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin =
    req.headers.origin ||
    (process.env.NODE_ENV === 'production'
      ? 'https://yanthrika2026.vercel.app'
      : 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  switch (action) {
    case 'login':               return adminLogin(req, res);
    case 'logout':              return adminLogout(req, res);
    case 'session':             return adminSession(req, res);
    case 'get-registrations':   return getRegistrations(req, res);
    case 'delete-registration': return deleteRegistration(req, res);
    case 'update-registration': return updateRegistration(req, res);
    case 'toggle-event':        return toggleEvent(req, res);
    case 'get-event-status':    return getEventStatus(req, res);
    default:
      return res.status(400).json({ error: `Unknown action: "${action}"` });
  }
}
