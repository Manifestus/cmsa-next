export type Role =
    | "cashier"
    | "admin"
    | "super_admin"
    | "doctor"
    | "nurse"
    | "receptionist"
    | "lab_tech"
    | "patient";

export const ALL_ROLES: Role[] = [
    "cashier",
    "admin",
    "super_admin",
    "doctor",
    "nurse",
    "receptionist",
    "lab_tech",
    "patient",
];

export const hasAnyRole = (userRoles: string[] | undefined, need: Role | Role[]) => {
    const have = new Set((userRoles ?? []).map((r) => r.toLowerCase()));
    const req = Array.isArray(need) ? need : [need];
    return req.some((r) => have.has(r));
};

// semantic helpers (optional but nice for readability)
export const can = {
    // Patients (existing)
    patientView:   (roles?: string[]) => hasAnyRole(roles, ["receptionist","nurse","doctor","admin","super_admin"]),
    patientCreate: (roles?: string[]) => hasAnyRole(roles, ["receptionist","nurse","doctor","admin","super_admin"]),
    patientEdit:   (roles?: string[]) => hasAnyRole(roles, ["nurse","doctor","admin","super_admin"]),
    patientDelete: (roles?: string[]) => hasAnyRole(roles, ["admin","super_admin"]),

    // Cashier / POS (existing)
    cashierArea:   (roles?: string[]) => hasAnyRole(roles, ["cashier","admin","super_admin"]),
    invoicesArea:  (roles?: string[]) => hasAnyRole(roles, ["cashier","admin","super_admin"]),

    // Lab (existing)
    labArea:       (roles?: string[]) => hasAnyRole(roles, ["lab_tech","doctor","admin","super_admin"]),

    // Admin (existing)
    adminArea:     (roles?: string[]) => hasAnyRole(roles, ["admin","super_admin"]),

    // ✅ Preclinic (new)
    preclinicView:   (roles?: string[]) => hasAnyRole(roles, ["nurse","doctor","admin","super_admin"]),
    preclinicCreate: (roles?: string[]) => hasAnyRole(roles, ["nurse","doctor","admin","super_admin"]),
    preclinicEdit:   (roles?: string[]) => hasAnyRole(roles, ["doctor","admin","super_admin"]),
    preclinicDelete: (roles?: string[]) => hasAnyRole(roles, ["admin","super_admin"]),
};