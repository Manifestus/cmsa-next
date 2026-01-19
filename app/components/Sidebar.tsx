"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MENU } from "@/app/lib/nav/menu";
import { hasAnyRole, type Role } from "@/app/lib/auth/roles";
import { useAuth } from "@/app/lib/auth/useAuth";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    // persist collapse preference
    useEffect(() => {
        const v = localStorage.getItem("sb-collapsed");
        if (v) setCollapsed(v === "1");
    }, []);
    useEffect(() => {
        localStorage.setItem("sb-collapsed", collapsed ? "1" : "0");
    }, [collapsed]);

    const { roles, status } = useAuth();
    const { data: session } = useSession();
    const pathname = usePathname();

    const items = useMemo(() => {
        return MENU.filter((m) => !m.roles || hasAnyRole(roles, m.roles as Role[]));
    }, [roles]);

    // hide entirely until auth state known (prevents flash)
    if (status === "loading") return null;

    const isAuthed = !!session;

    return (
        <aside
            className={cn(
                "sticky top-0 h-[100dvh] flex flex-col bg-white/80 backdrop-blur border-r shadow-sm",
                "transition-[width] duration-300 ease-in-out",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Top: Logo + toggle */}
            <div className="flex items-center justify-between px-3 py-3">
                <div
                    className={cn(
                        "font-semibold tracking-tight",
                        collapsed && "opacity-0 pointer-events-none w-0"
                    )}
                >
                    CMSA
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Toggle sidebar"
                    onClick={() => setCollapsed((v) => !v)}
                >
                    <Icons.ChevronLeft
                        className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")}
                    />
                </Button>
            </div>

            {/* Middle: nav items */}
            <nav className="mt-2 px-2 flex-1">
                {items.map((item) => {
                    const Icon = (Icons as any)[item.icon] ?? Icons.Circle;
                    const active = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="block group">
                            <div
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2 my-1",
                                    "hover:bg-muted transition-colors",
                                    active && "bg-muted"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <AnimatePresence initial={false}>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -6 }}
                                            className="text-sm"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: auth action */}
            <div className="p-3 mt-auto">
                {isAuthed ? (
                    <Button
                        variant="destructive"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        aria-label="Logout"
                    >
                        <Icons.LogOut className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </Button>
                ) : (
                    <Button
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => signIn("auth0")}
                        aria-label="Sign in"
                    >
                        <Icons.LogIn className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Sign in</span>}
                    </Button>
                )}
            </div>
        </aside>
    );
}