import type { IncomingMessage, ServerResponse } from 'http';

// Simple Vercel-style serverless function that forwards an email request to Resend.
// Expects POST { email: string, shareUrl: string }

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Allow', 'POST');
      res.end('Method Not Allowed');
      return;
    }

    // Parse body (Vercel provides parsed body for JSON in many runtimes; handle raw case)
    const raw = (req as any).body || await new Promise<string>((resolve) => {
      let data = '';
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => resolve(data));
    });

    const { email, shareUrl } = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!email || !shareUrl) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Missing email or shareUrl' }));
      return;
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Resend API key not configured on server (RESEND_API_KEY)' }));
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Carefinder <noreply@carefinder.app>',
        to: email,
        subject: 'Your Carefinder hospital list',
        html: `
          <p>Here is your curated Carefinder hospital list:</p>
          <p><a href="${shareUrl}">${shareUrl}</a></p>
          <p>Open the link to see the same search filters and results.</p>
        `,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'Resend API error', details: text }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err?.message ?? String(err) }));
  }
}
