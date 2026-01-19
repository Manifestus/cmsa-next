"use client";

import * as Icons from "lucide-react";
import type { Role } from "@/app/lib/auth/roles";

export type NavItem = {
    label: string;
    href: string;
    icon: keyof typeof Icons; // lucide icon name
    exact?: boolean;
    roles?: Role[]; // if omitted, visible to any authenticated user
};

// Central place to control what appears, where it routes, and who can see it.
export const MENU: NavItem[] = [
    {
        label: "Dashboard",
        href: "/",
        icon: "LayoutDashboard",
        exact: true,
        // visible to all authenticated roles
    },
    {
        label: "Patients",
        href: "/patients",
        icon: "Users",
        roles: ["receptionist", "nurse", "doctor", "admin", "super_admin"],
    },
    {
        label: "Cashier",
        href: "/cashier",
        icon: "WalletCards",
        roles: ["cashier", "admin", "super_admin"],
    },
    {
        label: "Invoices",
        href: "/invoice",
        icon: "ReceiptText",
        roles: ["cashier", "admin", "super_admin"],
    },
    {
        label: "Lab",
        href: "/lab",
        icon: "FlaskConical",
        roles: ["lab_tech", "doctor", "admin", "super_admin"],
    },
    {
        label: "Admin",
        href: "/admin",
        icon: "Settings",
        roles: ["admin", "super_admin"],
    },
];