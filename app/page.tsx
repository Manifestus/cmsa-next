"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { useAuth } from "@/app/lib/auth/useAuth";
import { MENU } from "@/app/lib/nav/menu";
import { hasAnyRole, type Role } from "@/app/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Safe icon resolver from MENU.icon (string) to lucide-react component.
 * Falls back to "Circle" if icon name is missing/typoed.
 */
function getIcon(name?: string) {
    const Icon = name && (Icons as Record<string, any>)[name];
    return Icon ?? Icons.Circle;
}

export default function Home() {
    const { me, roles, status, meLoading, meError } = useAuth();

    // RBAC filter (guard roles with ?? [])
    const visible = MENU.filter(
        (m) => !m.roles || hasAnyRole(roles ?? [], m.roles as Role[])
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Welcome to CMSA</h1>
                    <p className="text-sm text-muted-foreground">
                        {status === "authenticated"
                            ? `Hello, ${me?.user.fullName ?? me?.user.email ?? "User"}`
                            : "Please sign in to continue."}
                    </p>
                </div>
                {status === "authenticated" && (
                    <div className="text-xs text-muted-foreground">
                        Roles: {roles?.length ? roles.join(", ") : "—"}
                    </div>
                )}
            </div>

            {/* Loading state for /api/proxy/me */}
            {meLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-xl border p-4">
                            <Skeleton className="h-5 w-1/2 mb-2" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                    ))}
                </div>
            )}

            {/* API error (still show sign-in status text above) */}
            {meError && (
                <Alert variant="destructive">
                    <AlertTitle>Couldn’t load your profile</AlertTitle>
                    <AlertDescription>
                        {meError.message || "Please try again."}
                    </AlertDescription>
                </Alert>
            )}

            {/* Buttons grid */}
            {!meLoading && !meError && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {visible.map((m) => {
                        const Icon = getIcon(m.icon);
                        return (
                            <Link key={m.href} href={m.href} className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full h-20 flex items-center justify-start gap-3 rounded-xl border px-4 text-left"
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{m.label}</span>
                                        <span className="text-xs text-muted-foreground">
                      {m.href}
                    </span>
                                    </div>
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}