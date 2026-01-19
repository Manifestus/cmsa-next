"use client";

import { useSession } from "next-auth/react";
export async function apiGet(path: string) {
    const r = await fetch(`/api/proxy${path}`, { cache: 'no-store' });
    if (!r.ok) throw await r.json().catch(() => ({ error: r.statusText }));
    return r.json();
}
export async function apiPost(path: string, body: unknown) {
    const r = await fetch(`/api/proxy${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
    });
    const text = await r.text();
    const data = (() => { try { return JSON.parse(text); } catch { return text; } })();
    if (!r.ok) throw data;
    return data;
}
export async function apiDelete(path: string) {
    const r = await fetch(`/api/proxy${path}`, { method: 'DELETE' });
    if (!r.ok) throw await r.json().catch(() => ({ error: r.statusText }));
    return r.json();
}

export function useApi() {
    const { data: session } = useSession();
    const token = (session as any)?.accessToken as string | undefined;

    async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
            ...init,
            headers: {
                ...(init.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                "Content-Type": (init.headers as any)?.["Content-Type"] ?? "application/json",
            },
        });
        if (!res.ok) throw new Error(`${path} ${res.status}`);
        return res.json() as Promise<T>;
    }

    return { api, token };
}