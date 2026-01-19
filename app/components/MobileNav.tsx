"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MENU } from "@/app/lib/nav/menu";
import { hasAnyRole, type Role } from "@/app/lib/auth/roles";
import { useAuth } from "@/app/lib/auth/useAuth";

export default function MobileNav() {
    const [open, setOpen] = useState(false);
    const { roles } = useAuth();

    const items = useMemo(() => {
        return MENU.filter((m) => !m.roles || hasAnyRole(roles, m.roles as Role[]));
    }, [roles]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <div className="sticky top-0 z-30 flex h-12 items-center border-b bg-white/80 backdrop-blur px-3 lg:hidden">
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open menu">
                        <Icons.Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <div className="ml-2 font-semibold">CMSA</div>
            </div>
            <SheetContent side="left" className="p-0">
                <div className="p-4 text-lg font-semibold">Menu</div>
                <nav className="px-2">
                    {items.map((item) => {
                        const Icon = (Icons as any)[item.icon] ?? Icons.Circle;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 my-1 rounded-xl hover:bg-muted"
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}