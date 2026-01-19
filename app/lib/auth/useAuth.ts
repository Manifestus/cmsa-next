"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import type { Role } from "./roles";

type MeResponse = {
    user: { id: string; email: string; fullName: string; username: string };
    roles: Role[];
};

export function useAuth() {
    const { data: session, status } = useSession();

    const me = useQuery<MeResponse>({
        queryKey: ["me"],
        enabled: status === "authenticated",
        queryFn: async () => {
            const res = await fetch("/api/proxy/me", {
                credentials: "include",
                cache: "no-store",
            });
            if (!res.ok) {
                throw new Error(`/proxy/me error ${res.status}`);
            }
            return res.json();
        },
        staleTime: 30_000,
    });

    return {
        status,
        me: me.data,
        meLoading: me.isLoading,
        meError: me.error as Error | null,
        roles: me.data?.roles ?? [],
    };
}