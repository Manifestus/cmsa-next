"use client";

import { ReactNode, useMemo } from "react";
import { useAuth } from "@/app/lib/auth/useAuth";
import { hasAnyRole, type Role } from "@/app/lib/auth/roles";
import Link from "next/link";

export function RoleGate({ need, children }: { need: Role | Role[]; children: ReactNode }) {
    const { status, meLoading, roles } = useAuth();

    if (status === "loading" || meLoading) return <div className="p-4">Checking permissions…</div>;
    if (status !== "authenticated") {
        return (
            <div className="p-4">
                You need to sign in. <a href="/api/auth/signin" className="underline">Login</a>
            </div>
        );
    }

    const allowed = useMemo(() => hasAnyRole(roles, need), [roles, need]);
    if (!allowed) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">Forbidden</h2>
                <p className="mb-4">Your account is authenticated but lacks the required role(s).</p>
                <Link className="underline" href="/forbidden">Details</Link>
            </div>
        );
    }

    return <>{children}</>;
}