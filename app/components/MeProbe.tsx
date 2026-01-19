"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export function MeProbe() {
    const { data: session } = useSession();
    const token = (session as any)?.accessToken as string | undefined;

    const q = useQuery({
        queryKey: ["me"],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error(`API ${res.status}`);
            return res.json();
        },
    });

    if (!token) return <div>Login to test API</div>;
    if (q.isLoading) return <div>Loading…</div>;
    if (q.isError) return <div>Error: {(q.error as Error).message}</div>;
    return <pre>{JSON.stringify(q.data, null, 2)}</pre>;
}