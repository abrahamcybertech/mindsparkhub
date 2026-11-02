import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';
import { DonationStartSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`donate-start:${ip}`, 5, 300, 'ip');
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    if (body.website_url_check) {
      return NextResponse.json({ error: 'The form could not be validated.' }, { status: 400 });
    }

    const parsed = DonationStartSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid form submission.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const data = parsed.data;
    const db = getDatabase();
    try {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS donation_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
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

    const minRow = (await db.prepare("SELECT value FROM donation_settings WHERE key = 'minAmount'").get()) as { value: string } | undefined;
    const maxRow = (await db.prepare("SELECT value FROM donation_settings WHERE key = 'maxAmount'").get()) as { value: string } | undefined;
    const minAmount = Number(minRow?.value || '100');
    const maxAmount = Number(maxRow?.value || '1000000');

    if (!Number.isFinite(data.amount) || data.amount < minAmount || data.amount > maxAmount) {
      return NextResponse.json({ error: `Amount must be between ${minAmount} and ${maxAmount} Naira.` }, { status: 400 });
    }

    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referenceCode = `MSH-DON-${randomHex}`;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO donations (
        id, reference_code, amount, currency, donation_type, designation, donor_name, donor_email, donor_phone,
        is_anonymous, note, consent_given, consent_timestamp, status, provider, ip_address, created_at, updated_at
      ) VALUES (?, ?, ?, 'NGN', ?, ?, ?, ?, ?, ?, ?, 1, ?, 'pending', 'paystack', ?, ?, ?)
    `).run(
      id,
      referenceCode,
      data.amount,
      data.donationType,
      data.designation,
      data.isAnonymous ? null : (data.donorName || null),
      data.donorEmail,
      data.donorPhone || null,
      data.isAnonymous ? 1 : 0,
      data.note || null,
      now,
      ip,
      now,
      now
    );

    await recordAuditLog({
      actorId: 'public_citizen',
      actorRole: 'ANONYMOUS',
      action: 'DONATION_INITIATED',
      targetEntity: 'donations',
      targetId: id,
      ipAddress: ip,
      details: `Ref: ${referenceCode}, Amount: ${data.amount} NGN, Type: ${data.donationType}, Designation: ${data.designation}`,
      outcome: 'SUCCESS',
    });

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Payment provider is not configured.' }, { status: 503 });
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mindsparkhub.org'}/donate/thank-you`;
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.donorEmail,
        amount: data.amount * 100,
        currency: 'NGN',
        reference: referenceCode,
        callback_url: callbackUrl,
        metadata: {
          donation_id: id,
          designation: data.designation,
          donation_type: data.donationType,
          is_anonymous: data.isAnonymous ? 1 : 0,
        },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) {
      await db.prepare("UPDATE donations SET status = 'failed', updated_at = ? WHERE id = ?").run(now, id);
      return NextResponse.json({ error: 'Unable to initialize payment.' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference: referenceCode,
    });
  } catch (error) {
    console.error('Donation start error:', error);
    return NextResponse.json({ error: 'An unexpected operational error occurred.' }, { status: 500 });
  }
}
