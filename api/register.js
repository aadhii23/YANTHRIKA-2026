import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

/* ─────────────────────────────────────────────────────────────
   WHATSAPP GROUP LINKS — per event
   ───────────────────────────────────────────────────────────── */
const WHATSAPP_LINKS = {
  'brainware':               'https://chat.whatsapp.com/JEuEUb3xswX74v9h1SjcPv',
  'verbal wars':             'https://chat.whatsapp.com/HWxoKU9FvcJ59eo3J4JjZt',
  'brainy bunch':            'https://chat.whatsapp.com/EtsXoDsK3RdF94Ab8tEv4C',
  'syntax wars':             'https://chat.whatsapp.com/BZn8ggYPYdL1pu5bwcnfuo',
  'bytebuild':               null,
  'byte build':              null,
  'software':                'https://chat.whatsapp.com/JoonGEfAPmWJmqHu4syWjI',
  'hardware':                'https://chat.whatsapp.com/JoonGEfAPmWJmqHu4syWjI',
  'venture verse':           'https://chat.whatsapp.com/HuAYMgpQQEA7EgUi13afpR',
  'bgmi':                    'https://chat.whatsapp.com/In2lChtr8fb5y4Xj06Xs52',
  'squad siege (bgmi)':      'https://chat.whatsapp.com/In2lChtr8fb5y4Xj06Xs52',
  'free fire':               'https://chat.whatsapp.com/IIQ5D7tLyiB3xdDjrfy5gM',
  'squad siege (free fire)': 'https://chat.whatsapp.com/IIQ5D7tLyiB3xdDjrfy5gM',
  'frame & fame':            'https://chat.whatsapp.com/JiiXjR3lkJcJ6dig63yMT7',
  'vlogging':                'https://chat.whatsapp.com/JiiXjR3lkJcJ6dig63yMT7',
  'old roll':                'https://chat.whatsapp.com/I1moKIoGvpyChA6Zm8uTI6',
  'photography':             'https://chat.whatsapp.com/I1moKIoGvpyChA6Zm8uTI6',
  'decipher':                '__DECIPHER__',
};

function getWhatsappBlock(eventName) {
  const lower = eventName.toLowerCase();

  if (lower.includes('decipher')) {
    return `
      <div style="background:#fff8e1;border-left:4px solid #f9a825;padding:16px 20px;margin:24px 0;border-radius:4px;">
        <p style="margin:0;font-size:15px;color:#333;">
          <strong>🎟️ Exclusive Event Notice</strong><br/><br/>
          <em>Decipher — Escape Room</em> is an <strong>exclusive event</strong> and is only available
          for participants who have found the <strong>Golden Ticket</strong>.<br/><br/>
          If you have the Golden Ticket, our team will reach out to you directly with further instructions.
        </p>
      </div>`;
  }

  if (lower.includes('bytebuild') || lower.includes('byte build')) {
    return whatsappLinkBlock('https://chat.whatsapp.com/JoonGEfAPmWJmqHu4syWjI');
  }

  const key = Object.keys(WHATSAPP_LINKS).find(k => lower.includes(k));
  const link = key ? WHATSAPP_LINKS[key] : null;
  if (!link || link === '__DECIPHER__') return '';
  return whatsappLinkBlock(link);
}

function whatsappLinkBlock(link) {
  return `
    <div style="background:#e8f5e9;border-left:4px solid #43a047;padding:16px 20px;margin:24px 0;border-radius:4px;">
      <p style="margin:0 0 8px 0;font-size:14px;color:#333;">
        <strong>📲 Join the Official WhatsApp Group</strong><br/>
        Stay updated with event announcements, schedule changes, and important notices.
      </p>
      <a href="${link}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:14px;">
        Join WhatsApp Group →
      </a>
    </div>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const {
      event_name,
      college_name,
      team_name,
      leader_name,
      leader_email,
      leader_phone,
      additional_members = []
    } = req.body;

    if (!event_name || !college_name || !leader_name || !leader_email || !leader_phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const event_id = `YN2026-${randomNum}`;

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    console.log('[register] supabaseUrl present:', !!supabaseUrl);
    console.log('[register] supabaseKey present:', !!supabaseKey);
    console.log('[register] Creating Supabase client...');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[register] Missing Supabase Environment Variables');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[register] Supabase client created successfully');

    // 🚫 CHECK EVENT IS OPEN — use local supabase client directly, avoid second client in event-state
    let eventOpen = true;
    try {
      const { data, error } = await supabase
        .from('event_status')
        .select('is_open')
        .eq('event_name', event_name)
        .single();
      if (!error && data) eventOpen = data.is_open;
    } catch (e) {
      console.warn('[register] event_status check failed, defaulting to open:', e.message);
    }

    if (!eventOpen) {
      return res.status(400).json({
        success: false,
        message: 'Registrations for this event are currently closed. Please try another event.',
      });
    }

    // ✅ INSERT INTO SUPABASE
    const insertData = {
      event_name,
      college_name,
      team_name: team_name || null,
      leader_name,
      leader_email,
      leader_phone,
      member2_name:  additional_members[0]?.name  || null,
      member2_email: additional_members[0]?.email || null,
      member2_phone: additional_members[0]?.phone || null,
      member3_name:  additional_members[1]?.name  || null,
      member3_email: additional_members[1]?.email || null,
      member3_phone: additional_members[1]?.phone || null,
      member4_name:  additional_members[2]?.name  || null,
      member4_email: additional_members[2]?.email || null,
      member4_phone: additional_members[2]?.phone || null,
      event_id
    };

    console.log('[register] Attempting to insert:', JSON.stringify(insertData, null, 2));

    const { data: insertedData, error: dbError } = await supabase
      .from('event_registrations')
      .insert([insertData])
      .select();

    if (dbError) {
      console.error('Supabase Insert Error:', JSON.stringify(dbError, null, 2));
      return res.status(500).json({ 
        success: false, 
        message: 'Database error. Please try again.',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    console.log('[register] Successfully inserted:', insertedData);

    if (!insertedData || insertedData.length === 0) {
      console.error('[register] No data returned after insert');
      return res.status(500).json({ 
        success: false, 
        message: 'Registration failed - no data returned'
      });
    }

    // ✅ SEND CONFIRMATION EMAIL
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);

      const membersHtml = additional_members.map((m, i) => `
        <tr>
          <td colspan="2" style="padding:8px 0 4px;font-weight:bold;color:#555;font-size:13px;">Team Member ${i + 2}</td>
        </tr>
        <tr><td style="padding:3px 0;color:#777;font-size:13px;">Name</td><td style="padding:3px 0;font-size:13px;">${m.name}</td></tr>
        <tr><td style="padding:3px 0;color:#777;font-size:13px;">Email</td><td style="padding:3px 0;font-size:13px;">${m.email || 'N/A'}</td></tr>
        <tr><td style="padding:3px 0;color:#777;font-size:13px;">Phone</td><td style="padding:3px 0;font-size:13px;">${m.phone || 'N/A'}</td></tr>
      `).join('');

      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#d32f2f;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:2px;">YANTHRIKA 2026</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:1px;">STATE LEVEL INTER COLLEGE TECH FEST</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#333;">Hello <strong>${leader_name}</strong>,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;">
              You have successfully registered for <strong style="color:#d32f2f;">${event_name}</strong>.
              We're excited to have you at Yanthrika 2026!
            </p>
            <div style="background:#fafafa;border:2px dashed #d32f2f;border-radius:6px;padding:20px;text-align:center;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:12px;color:#999;letter-spacing:2px;text-transform:uppercase;">Your Unique Event ID</p>
              <p style="margin:0;font-size:28px;font-weight:bold;color:#d32f2f;letter-spacing:4px;">${event_id}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#999;">Keep this safe — required for entry on event day</p>
            </div>
            <h3 style="margin:0 0 12px;font-size:15px;color:#333;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">Registration Details</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:4px 0;color:#777;font-size:13px;width:140px;">College</td>
                <td style="padding:4px 0;font-size:13px;">${college_name}</td>
              </tr>
              ${team_name ? `<tr><td style="padding:4px 0;color:#777;font-size:13px;">Team Name</td><td style="padding:4px 0;font-size:13px;">${team_name}</td></tr>` : ''}
              <tr><td colspan="2" style="padding:12px 0 4px;font-weight:bold;color:#555;font-size:13px;">Team Leader</td></tr>
              <tr><td style="padding:3px 0;color:#777;font-size:13px;">Name</td><td style="padding:3px 0;font-size:13px;">${leader_name}</td></tr>
              <tr><td style="padding:3px 0;color:#777;font-size:13px;">Email</td><td style="padding:3px 0;font-size:13px;">${leader_email}</td></tr>
              <tr><td style="padding:3px 0;color:#777;font-size:13px;">Phone</td><td style="padding:3px 0;font-size:13px;">${leader_phone}</td></tr>
              ${membersHtml}
            </table>
            ${getWhatsappBlock(event_name)}
            <p style="margin:24px 0 0;font-size:14px;color:#555;">
              We look forward to seeing you at <strong>Sapthagiri NPS University, Bengaluru</strong> on <strong>April 16–17, 2026</strong>.
            </p>
            <p style="margin:8px 0 0;font-size:14px;color:#555;">
              Best regards,<br/>
              <strong>Yanthrika Organizing Team</strong><br/>
              School of Applied Science · Tensor Tribe
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:11px;color:#aaa;">This is an automated confirmation email. Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      try {
        const { data, error } = await resend.emails.send({
          from: 'Yanthrika Team <events@yanthrikasnpsu.in>',
          to: [leader_email],
          subject: `Yanthrika 2026 — Registration Confirmed: ${event_name}`,
          html: emailHtml,
        });
        if (error) console.error('Resend error:', error);
        else console.log('Email sent, ID:', data?.id);
      } catch (emailErr) {
        console.error('Email exception:', emailErr);
      }
    } else {
      console.warn('RESEND_API_KEY not set. Skipping email.');
    }

    return res.status(200).json({ success: true, event_id });

  } catch (error) {
    console.error('[register] handler error:', error?.message || error);
    console.error('[register] stack:', error?.stack);
    return res.status(500).json({ success: false, message: 'Internal Server Error', detail: error?.message });
  }
}
