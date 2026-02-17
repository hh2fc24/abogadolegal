import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEIMSER_INGEST_API_KEY;
        // Fallback URL if not set in env, helpful for testing or default config
        const geimserUrl = process.env.GEIMSER_API_URL || 'https://api.geimser.com/api/leads/ingest';

        if (!apiKey) {
            console.error('[api/bot/lead] GEIMSER_INGEST_API_KEY is not set');
            // Return 200 to frontend to not break UX, but log error
            return NextResponse.json({ ok: false, error: 'Configuration error' }, { status: 500 });
        }

        const body = await req.json();
        const { name, email, phone, message, meta } = body;

        // Validation
        if (!name || (!email && !phone)) {
            return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
        }

        const payload = {
            name,
            email,
            phone,
            message, // Motive/Summary
            source: 'lawyer_site_bot',
            meta: {
                ...meta,
                userAgent: req.headers.get('user-agent'),
                timestamp: new Date().toISOString(),
            },
        };

        // Retry logic (1 retry)
        let attempts = 0;
        let success = false;
        let lastError = null;

        while (attempts < 2 && !success) {
            attempts++;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                const res = await fetch(geimserUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (res.ok) {
                    success = true;
                } else {
                    const errText = await res.text();
                    lastError = `Geimser API error: ${res.status} ${errText}`;
                    console.warn(`[api/bot/lead] Attempt ${attempts} failed: ${lastError}`);
                }
            } catch (err) {
                lastError = err instanceof Error ? err.message : String(err);
                console.warn(`[api/bot/lead] Attempt ${attempts} network error: ${lastError}`);
            }
        }

        if (success) {
            return NextResponse.json({ ok: true });
        } else {
            console.error('[api/bot/lead] All attempts failed', lastError);
            return NextResponse.json({ ok: false, error: 'Failed to ingest lead' }, { status: 502 });
        }

    } catch (error) {
        console.error('[api/bot/lead] Internal error', error);
        return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
    }
}
