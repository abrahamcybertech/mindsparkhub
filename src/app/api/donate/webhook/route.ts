import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';
import { sendEmail } from '@/lib/email';

function verifyPaystackSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
  return hash === signature;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[character];
  });
}

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Provider not configured' }, { status: 503 });
    }

    const signature = req.headers.get('x-paystack-signature');
    const rawBody = await req.text();
    if (!verifyPaystackSignature(rawBody, signature, secretKey)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== 'charge.success') {
      return NextResponse.json({ received: true });
    }

    const data = event.data || {};
    const reference = data.reference;
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const db = getDatabase();
    try {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS donations (
          id TEXT PRIMARY KEY,
          reference_code TEXT UNIQUE NOT NULL,
          amount INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'NGN',
          donation_type TEXT NOT NULL,
          designation TEXT NOT NULL,
          donor_name TEXT,
          donor_email TEXT NOT NULL,
          donor_phone TEXT,
          is_anonymous INTEGER DEFAULT 0,
          note TEXT,
          consent_given INTEGER NOT NULL,
          consent_timestamp TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          provider TEXT NOT NULL DEFAULT 'paystack',
          provider_reference TEXT,
          subscription_code TEXT,
          subscription_status TEXT,
          cancel_url TEXT,
          ip_address TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS donation_status_history (
          id TEXT PRIMARY KEY,
          donation_id TEXT NOT NULL,
          status TEXT NOT NULL,
          actor_id TEXT,
          actor_role TEXT,
          note TEXT,
          created_at TEXT NOT NULL
        );
      `);
    } catch {}
    const donation = (await db.prepare('SELECT * FROM donations WHERE reference_code = ?').get(reference)) as any;
    if (!donation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (donation.status === 'successful') {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const paidAmount = Number(data.amount || 0) / 100;
    const currency = data.currency || 'NGN';
    if (paidAmount !== Number(donation.amount) || currency !== donation.currency) {
      await db.prepare("UPDATE donations SET status = 'failed', updated_at = ? WHERE id = ?").run(new Date().toISOString(), donation.id);
      return NextResponse.json({ error: 'Amount or currency mismatch' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const providerRef = data.id ? String(data.id) : (data.reference || reference);

    await db.prepare("UPDATE donations SET status = 'successful', provider_reference = ?, updated_at = ? WHERE id = ?").run(providerRef, now, donation.id);

    await db.prepare('INSERT INTO donation_status_history (id, donation_id, status, actor_id, actor_role, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      crypto.randomUUID(),
      donation.id,
      'successful',
      'system',
      'SYSTEM',
      'Confirmed via Paystack webhook',
      now
    );

    try {
      const safeName = donation.is_anonymous ? 'Supporter' : escapeHtml(donation.donor_name || 'Supporter');
      await sendEmail({
        to: donation.donor_email,
        subject: 'MindSpark Hub donation receipt',
        text: `Thank you for your support.\n\nReference: ${donation.reference_code}\nAmount: ${donation.currency} ${donation.amount}\nDesignation: ${donation.designation}\n\nWe appreciate your gift.\n\nMindSpark Hub`,
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #0f172a; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #0D2748;">Thank you for your gift</h2>
            <p>Hello ${safeName},</p>
            <p>Your donation has been confirmed.</p>
            <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <p style="margin: 4px 0;"><strong>Reference:</strong> ${escapeHtml(donation.reference_code)}</p>
              <p style="margin: 4px 0;"><strong>Amount:</strong> ${escapeHtml(donation.currency)} ${donation.amount}</p>
              <p style="margin: 4px 0;"><strong>Designation:</strong> ${escapeHtml(donation.designation)}</p>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${escapeHtml(donation.donation_type)}</p>
            </div>
            <p>We appreciate your support for MindSpark Hub.</p>
            <p style="margin-top: 28px; color: #64748b; font-size: 13px;">MindSpark Hub</p>
          </div>
        `,
      });
    } catch (e) {
      console.error('Receipt email failed:', e);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
