import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

/* ─────────────────────────────────────────────────────────────
   WHATSAPP GROUP LINKS — per event
   null = special handling (see getWhatsappBlock)
   ───────────────────────────────────────────────────────────── */
const WHATSAPP_LINKS = {
  'brainware':        'https://chat.whatsapp.com/JEuEUb3xswX74v9h1SjcPv',
  'verbal wars':      'https://chat.whatsapp.com/HWxoKU9FvcJ59eo3J4JjZt',
  'brainy bunch':     'https://chat.whatsapp.com/EtsXoDsK3RdF94Ab8tEv4C',
  'syntax wars':      'https://chat.whatsapp.com/BZn8ggYPYdL1pu5bwcnfuo',
  'bytebuild':        null, // resolved below by software/hardware keyword
  'byte build':       null,
  'software':         'https://chat.whatsapp.com/JoonGEfAPmWJmqHu4syWjI',
  'hardware':         'https://chat.whatsapp.com/JoonGEfAPmWJmqHu4syWjI',
  'venture verse':    'https://chat.whatsapp.com/HuAYMgpQQEA7EgUi13afpR',
  'bgmi':             'https://chat.whatsapp.com/In2lChtr8fb5y4Xj06Xs52',
  'squad siege (bgmi)': 'https://chat.whatsapp.com/In2lChtr8fb5y4Xj06Xs52',
  'free fire':        'https://chat.whatsapp.com/IIQ5D7tLyiB3xdDjrfy5gM',
  'squad siege (free fire)': 'https://chat.whatsapp.com/IIQ5D7tLyiB3xdDjrfy5gM',
  'frame & fame':     'https://chat.whatsapp.com/JiiXjR3lkJcJ6dig63yMT7',
  'vlogging':         'https://chat.whatsapp.com/JiiXjR3lkJcJ6dig63yMT7',
  'old roll':         'https://chat.whatsapp.com/I1moKIoGvpyChA6Zm8uTI6',
  'photography':      'https://chat.whatsapp.com/I1moKIoGvpyChA6Zm8uTI6',
  'decipher':         '__DECIPHER__',
};

/**
 * Returns an HTML block for the WhatsApp section of the email.
 * Handles the Decipher special case and ByteBuild software/hardware split.
 */
function getWhatsappBlock(eventName) {
  const lower = eventName.toLowerCase();

  // Decipher — exclusive event, no group link
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

  // ByteBuild — resolve by software or hardware keyword
  if (lower.includes('bytebuild') || lower.includes('byte build')) {
    const link = lower.includes('hardware')
      ? 'https://chat.whatsapp.com/JoonGEfAPmWJmqHu4syWjI'
      : 'https://chat.whatsapp.com/JoonGEfAPmWJmqHu4syWjI';
    return whatsappLinkBlock(link);
  }

  // General lookup
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

/* ─────────────────────────────────────────────────────────────
   SAPTHAGIRI NPS UNIVERSITY — per-event registration limits
   Applies only to SNPSU students. Other colleges are unlimited.
   BGMI and Free Fire are unlimited for everyone.
   ───────────────────────────────────────────────────────────── */
const SNPSU_LIMITS = {
  'Brainware':              20,
  'Verbal Wars':             8,
  'Byte Build (Software)':  10,
  'Byte Build (Hardware)':   5,
  'Venture Verse':          10,
  'Old Roll':                5,
  'Frame & Fame':           10,
  'Brainy Bunch':           30,
  'Syntax Wars':            12,
};

// These events have NO limit for anyone — skip all cap checks
const UNLIMITED_EVENTS = ['Squad Siege (BGMI)', 'Squad Siege (Free Fire)'];

/** Returns the SNPSU limit for a given event name, or null if unlimited */
function getSnpsuLimit(eventName) {
  // Check if the event is unlimited for everyone first
  if (UNLIMITED_EVENTS.some(e => eventName.toLowerCase().includes(e.toLowerCase()))) {
    return null;
  }
  // Exact match
  if (SNPSU_LIMITS[eventName] !== undefined) return SNPSU_LIMITS[eventName];
  // Substring fallback
  const lower = eventName.toLowerCase();
  const key = Object.keys(SNPSU_LIMITS).find(k => lower.includes(k.toLowerCase()));
  return key ? SNPSU_LIMITS[key] : null;
}

/** Returns true if the college name is Sapthagiri NPS University */
function isSnpsu(collegeName) {
  const lower = (collegeName || '').toLowerCase().replace(/[.\s]+/g, '');
  return lower.includes('sapthagiri') || lower.includes('snpsu') || lower.includes('saptagiri');
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

    // 1. Generate Unique Event ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const event_id = `YN2026-${randomNum}`;

    // 2. Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase Environment Variables');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Check SNPSU registration limit (if applicable)
    //    - BGMI and Free Fire: unlimited for everyone → skip
    //    - Other events: only SNPSU students are capped
    if (isSnpsu(college_name)) {
      const limit = getSnpsuLimit(event_name);
      if (limit !== null) {
        const { count, error: countError } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_name', event_name)
          .or('college_name.ilike.%sapthagiri%,college_name.ilike.%snpsu%,college_name.ilike.%saptagiri%');

        if (countError) {
          console.error('Limit check error:', countError);
          return res.status(400).json({
            success: false,
            message: `Sorry, registrations for Sapthagiri NPS University are currently unavailable for ${event_name}. Please contact the organizers.`,
          });
        }

        if (count >= limit) {
          return res.status(400).json({
            success: false,
            message: 'Seat for SNPSU is packed, sorry. You cannot register for this event.',
          });
        }
      }
    }

    // 4. Insert into Supabase
    const { error: dbError } = await supabase
      .from('event_registrations')
      .insert([{
        event_name,
        college_name,
        team_name,
        leader_name,
        leader_email,
        leader_phone,
        member2_name:  additional_members[0]?.name  || '',
        member2_email: additional_members[0]?.email || '',
        member2_phone: additional_members[0]?.phone || '',
        member3_name:  additional_members[1]?.name  || '',
        member3_email: additional_members[1]?.email || '',
        member3_phone: additional_members[1]?.phone || '',
        member4_name:  additional_members[2]?.name  || '',
        member4_email: additional_members[2]?.email || '',
        member4_phone: additional_members[2]?.phone || '',
        event_id
      }])
      .select();

    if (dbError) {
      console.error('Supabase Error:', dbError);
      return res.status(500).json({ success: false, message: 'Database error. Please try again.' });
    }

    // 5. Send Email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);

      const membersHtml = additional_members.map((m, i) => `
        <tr>
          <td colspan="2" style="padding:8px 0 4px;font-weight:bold;color:#555;font-size:13px;">
            Team Member ${i + 2}
          </td>
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

        <!-- Header -->
        <tr>
          <td style="background:#d32f2f;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:2px;">YANTHRIKA 2026</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:1px;">
              STATE LEVEL INTER COLLEGE TECH FEST
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#333;">
              Hello <strong>${leader_name}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;">
              You have successfully registered for <strong style="color:#d32f2f;">${event_name}</strong>.
              We're excited to have you at Yanthrika 2026!
            </p>

            <!-- Event ID -->
            <div style="background:#fafafa;border:2px dashed #d32f2f;border-radius:6px;padding:20px;text-align:center;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:12px;color:#999;letter-spacing:2px;text-transform:uppercase;">Your Unique Event ID</p>
              <p style="margin:0;font-size:28px;font-weight:bold;color:#d32f2f;letter-spacing:4px;">${event_id}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#999;">Keep this safe — required for entry on event day</p>
            </div>

            <!-- Registration Details -->
            <h3 style="margin:0 0 12px;font-size:15px;color:#333;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">
              Registration Details
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:4px 0;color:#777;font-size:13px;width:140px;">College</td>
                <td style="padding:4px 0;font-size:13px;">${college_name}</td>
              </tr>
              ${team_name ? `<tr><td style="padding:4px 0;color:#777;font-size:13px;">Team Name</td><td style="padding:4px 0;font-size:13px;">${team_name}</td></tr>` : ''}
              <tr>
                <td colspan="2" style="padding:12px 0 4px;font-weight:bold;color:#555;font-size:13px;">Team Leader</td>
              </tr>
              <tr><td style="padding:3px 0;color:#777;font-size:13px;">Name</td><td style="padding:3px 0;font-size:13px;">${leader_name}</td></tr>
              <tr><td style="padding:3px 0;color:#777;font-size:13px;">Email</td><td style="padding:3px 0;font-size:13px;">${leader_email}</td></tr>
              <tr><td style="padding:3px 0;color:#777;font-size:13px;">Phone</td><td style="padding:3px 0;font-size:13px;">${leader_phone}</td></tr>
              ${membersHtml}
            </table>

            <!-- WhatsApp block (event-specific) -->
            ${getWhatsappBlock(event_name)}

            <p style="margin:24px 0 0;font-size:14px;color:#555;">
              We look forward to seeing you at <strong>Sapthagiri NPS University, Bengaluru</strong> on
              <strong>April 16–17, 2026</strong>.
            </p>
            <p style="margin:8px 0 0;font-size:14px;color:#555;">
              Best regards,<br/>
              <strong>Yanthrika Organizing Team</strong><br/>
              School of Applied Science · Tensor Tribe
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:11px;color:#aaa;">
              This is an automated confirmation email. Please do not reply to this email.
            </p>
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

    // 6. Respond
    return res.status(200).json({ success: true, event_id });

  } catch (error) {
    console.error('Registration handler error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
