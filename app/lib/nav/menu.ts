// app/lib/nav/menu.ts
import type { Role } from "../auth/roles";

export type MenuItem = {
    label: string;
    href: string;
    icon: string;        // lucide icon name
    roles?: Role[];      // omit = everyone that is authenticated
    exact?: boolean;
};

export const MENU: MenuItem[] = [
    { label: "Inicio",     href: "/",             icon: "Home" },

    // Caja
    { label: "Caja",       href: "/cashier",      icon: "CreditCard", roles: ["cashier", "super_admin"] },
    { label: "Facturas",   href: "/invoice",      icon: "FileText",   roles: ["cashier","admin","super_admin"] },

    // Clínico
    { label: "Pacientes",  href: "/patients",     icon: "Users",      roles: ["receptionist","doctor","nurse","admin","super_admin"] },
    { label: "Preconsulta",href: "/preclinic",    icon: "Stethoscope",roles: ["doctor","nurse","admin","super_admin"] },

    // Laboratorio (si ya existe ruta /lab)
    { label: "Laboratorio",href: "/lab",          icon: "FlaskConical", roles: ["lab_tech","doctor","admin","super_admin"] },

    // Inventario / otras áreas (si existen)
    { label: "Facturación",href: "/billing",      icon: "ReceiptText", roles: ["cashier","admin","super_admin"] },
    { label: "Inventario", href: "/inventory",    icon: "Boxes",       roles: ["admin","super_admin"] },
    { label: "Ultrasonido",href: "/ultrasound",   icon: "ActivitySquare", roles: ["doctor","admin","super_admin"] },
    { label: "Odontología",href: "/dentistry",    icon: "Circle",      roles: ["doctor","admin","super_admin"] },
    { label: "Ginecología",href: "/gynecology",   icon: "Heart",       roles: ["doctor","admin","super_admin"] },

    // Administración
    { label: "Administración", href: "/admin",    icon: "Settings",    roles: ["admin","super_admin"] },
];