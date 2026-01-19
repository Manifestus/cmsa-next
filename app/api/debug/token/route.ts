import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = new URL('/auth/access-token', process.env.APP_BASE_URL!);
    const res = await fetch(url, {
        headers: { cookie: req.headers.get('cookie') ?? '' },
        cache: 'no-store',
    });

    if (!res.ok) return NextResponse.json({ ok: false, status: res.status }, { status: res.status });
    const json = await res.json(); // { token, expiresAt, scope }
    return NextResponse.json(json);
}