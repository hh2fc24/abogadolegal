import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function resolveGeimserIngestUrl(): string {
    const candidates = [
        process.env.GEIMSER_INGEST_URL,
        process.env.GEIMSER_API_URL, // legacy name
    ].filter(Boolean) as string[];

    const url = candidates.find((v) => {
        try {
            const u = new URL(v);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
            return false;
        }
    });

    return url || 'https://www.geimser.cl/api/leads/ingest';
}

function toErrorDetails(err: unknown): { message: string; cause?: any } {
    if (err instanceof Error) {
        // Node/undici often sets err.cause with code/message
        return { message: err.message, cause: (err as any).cause };
    }
    return { message: String(err) };
}

function normalizeApiKey(raw: string): { value: string; normalized: boolean } {
    const trimmed = raw.trim();
    if (trimmed.length >= 2) {
        const first = trimmed[0];
        const last = trimmed[trimmed.length - 1];
        if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
            const v = trimmed.slice(1, -1).trim();
            return { value: v, normalized: v !== raw };
        }
    }
    return { value: trimmed, normalized: trimmed !== raw };
}

export async function POST(req: NextRequest) {
    try {
        const apiKeyRaw = process.env.GEIMSER_INGEST_API_KEY;
        const geimserUrl = resolveGeimserIngestUrl();

        if (!apiKeyRaw) {
            console.error('[api/bot/lead] GEIMSER_INGEST_API_KEY is not set');
            // Return 200 to frontend to not break UX, but log error
            return NextResponse.json({ ok: false, error: 'Configuration error' }, { status: 500 });
        }

        const apiKeyNorm = normalizeApiKey(apiKeyRaw);
        if (apiKeyNorm.normalized) {
            console.warn('[api/bot/lead] Normalized GEIMSER_INGEST_API_KEY', { rawLen: apiKeyRaw.length, normalizedLen: apiKeyNorm.value.length });
        }

        const body = await req.json();
        const name =
            typeof body?.name === 'string'
                ? body.name.trim()
                : typeof body?.nombre === 'string'
                    ? body.nombre.trim()
                    : null;
        const email =
            typeof body?.email === 'string'
                ? body.email.trim()
                : typeof body?.correo === 'string'
                    ? body.correo.trim()
                    : null;
        const phone =
            typeof body?.phone === 'string'
                ? body.phone.trim()
                : typeof body?.telefono === 'string'
                    ? body.telefono.trim()
                    : null;
        let message =
            typeof body?.message === 'string'
                ? body.message.trim()
                : typeof body?.mensaje === 'string'
                    ? body.mensaje.trim()
                    : null;
        const motivo =
            typeof body?.motivo === 'string'
                ? body.motivo.trim()
                : typeof body?.service === 'string'
                    ? body.service.trim()
                    : typeof body?.servicio === 'string'
                        ? body.servicio.trim()
                        : null;
        const meta = body?.meta ?? null;

        if (!message) {
            message = motivo ? `Solicitud desde bot • Motivo: ${motivo}` : 'Solicitud desde bot (sin detalle adicional)';
        }

        // Validation
        if (!name || !message || (!email && !phone)) {
            console.warn('[api/bot/lead] Bad payload', {
                hasName: Boolean(name),
                hasMessage: Boolean(message),
                hasEmail: Boolean(email),
                hasPhone: Boolean(phone),
            });
            return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
        }

        const payload = {
            name,
            email,
            phone,
            message, // Motive/Summary
            source: 'lawyer_site_bot',
            meta: {
                ...(meta && typeof meta === 'object' ? meta : {}),
                motivo,
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
                        'Authorization': `Bearer ${apiKeyNorm.value}`,
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (res.ok) {
                    success = true;
                } else {
                    const errText = await res.text().catch(() => '');
                    lastError = `Geimser API error: ${res.status} ${errText?.slice?.(0, 300) ?? ''}`;
                    console.warn(`[api/bot/lead] Attempt ${attempts} failed: ${lastError}`);
                }
            } catch (err) {
                const details = toErrorDetails(err);
                lastError = details.message;
                console.warn(`[api/bot/lead] Attempt ${attempts} network error: ${details.message}`, {
                    url: geimserUrl,
                    cause: details.cause,
                });
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
