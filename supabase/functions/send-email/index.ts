import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = req.headers.get('Authorization');

  if (!serviceRoleKey || authorization !== `Bearer ${serviceRoleKey}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    return jsonResponse({ error: 'RESEND_API_KEY is not configured' }, 500);
  }

  let payload: EmailPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!payload.to || !payload.subject || !payload.html) {
    return jsonResponse({ error: 'to, subject, and html are required' }, 400);
  }

  const from = Deno.env.get('EMAIL_FROM') || 'MindSpark Hub <no-reply@mindsparkhub.org>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    return jsonResponse({ error: 'Email provider rejected the request', result }, 502);
  }

  return jsonResponse({ success: true, result });
});
