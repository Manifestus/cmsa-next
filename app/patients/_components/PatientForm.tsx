"use client";

import { useMemo, useState } from "react";
import type { Patient } from "@/app/lib/api/patients";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";

export type PatientFormValues = {
    mrn: string;
    firstName: string;
    lastName: string;
    dob?: string | null;
    sex?: "M" | "F" | "Other" | "Unknown" | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
};

type Mode = "create" | "edit";

export default function PatientForm({
                                        initial,
                                        onSubmit,
                                        submitting,
                                        mode, // optional: force mode if you prefer
                                    }: {
    initial: Partial<Patient> | undefined;
    submitting?: boolean;
    onSubmit: (values: PatientFormValues) => void | Promise<void>;
    mode?: Mode;
}) {
    const { roles } = useAuth();

    // Infer mode if not provided: if we have an id, treat as edit
    const inferredMode: Mode = useMemo(() => {
        if (mode) return mode;
        return initial?.id ? "edit" : "create";
    }, [mode, initial?.id]);

    // Permission gates aligned with Deno routes:
    // - create: frontdesk, cashier, admin, super_admin
    // - edit:   admin, super_admin
    const canSubmit = useMemo(() => {
        return inferredMode === "create"
            ? can.patientCreate(roles)
            : can.patientEdit(roles);
    }, [inferredMode, roles]);

    // We fully lock fields if user cannot submit in the given mode.
    const disabled = submitting || !canSubmit;

    const [vals, setVals] = useState<PatientFormValues>({
        mrn: initial?.mrn ?? "",
        firstName: initial?.firstName ?? "",
        lastName: initial?.lastName ?? "",
        dob: initial?.dob ?? null,
        sex: (initial?.sex as any) ?? null,
        phone: initial?.phone ?? null,
        email: initial?.email ?? null,
        address: initial?.address ?? null,
        city: initial?.city ?? null,
        region: initial?.region ?? null,
        country: initial?.country ?? null,
    });

    function set<K extends keyof PatientFormValues>(k: K, v: PatientFormValues[K]) {
        setVals((s) => ({ ...s, [k]: v }));
    }

    const roleHint =
        inferredMode === "create"
            ? "Requiere rol: recepción, caja, admin o super admin."
            : "Requiere rol: admin o super admin.";

    return (
        <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return; // no-op if not allowed
                onSubmit(vals);
            }}
        >
            {/* Permission banner */}
            {!canSubmit && (
                <div className="sm:col-span-2 rounded-lg border bg-amber-50 text-amber-900 px-4 py-3 text-sm">
                    No tienes permisos para {inferredMode === "create" ? "crear" : "editar"} pacientes. {roleHint}
                </div>
            )}

            <Input
                label="MRN"
                required
                value={vals.mrn}
                onChange={(v) => set("mrn", v)}
                disabled={disabled}
            />
            <Input
                label="Nombre"
                required
                value={vals.firstName}
                onChange={(v) => set("firstName", v)}
                disabled={disabled}
            />
            <Input
                label="Apellido"
                required
                value={vals.lastName}
                onChange={(v) => set("lastName", v)}
                disabled={disabled}
            />
            <Input
                label="Fecha de nacimiento"
                type="date"
                value={vals.dob ?? ""}
                onChange={(v) => set("dob", v || null)}
                disabled={disabled}
            />
            <Select
                label="Sexo"
                value={vals.sex ?? ""}
                onChange={(v) => set("sex", (v || null) as any)}
                disabled={disabled}
                options={[
                    { value: "", label: "—" },
                    { value: "F", label: "Femenino" },
                    { value: "M", label: "Masculino" },
                    { value: "Other", label: "Otro" },
                    { value: "Unknown", label: "Desconocido" },
                ]}
            />

            <Input
                label="Teléfono"
                value={vals.phone ?? ""}
                onChange={(v) => set("phone", v || null)}
                disabled={disabled}
            />
            <Input
                label="Correo electrónico"
                type="email"
                value={vals.email ?? ""}
                onChange={(v) => set("email", v || null)}
                disabled={disabled}
            />
            <Input
                label="Dirección"
                value={vals.address ?? ""}
                onChange={(v) => set("address", v || null)}
                disabled={disabled}
            />
            <Input
                label="Ciudad"
                value={vals.city ?? ""}
                onChange={(v) => set("city", v || null)}
                disabled={disabled}
            />
            <Input
                label="Región / Departamento"
                value={vals.region ?? ""}
                onChange={(v) => set("region", v || null)}
                disabled={disabled}
            />
            <Input
                label="País"
                value={vals.country ?? ""}
                onChange={(v) => set("country", v || null)}
                disabled={disabled}
            />

            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
                <button
                    type="submit"
                    disabled={disabled}
                    title={!canSubmit ? roleHint : undefined}
                    className="rounded-lg bg-primary text-primary-foreground px-4 py-2 disabled:opacity-60"
                >
                    {submitting ? "Guardando…" : "Guardar"}
                </button>
            </div>
        </form>
    );
}

function Input({
                   label,
                   value,
                   onChange,
                   required,
                   type = "text",
                   disabled,
               }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    type?: string;
    disabled?: boolean;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <input
                className="rounded-xl border px-3 py-2 disabled:bg-muted/40 disabled:text-muted-foreground"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                type={type}
                disabled={disabled}
            />
        </label>
    );
}

function Select({
                    label,
                    value,
                    onChange,
                    options,
                    disabled,
                }: {
    label: string;
    value: string | undefined;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <select
                className="rounded-xl border px-3 py-2 disabled:bg-muted/40 disabled:text-muted-foreground"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}