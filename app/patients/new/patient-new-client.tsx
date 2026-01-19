"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";
import PatientForm, { type PatientFormValues } from "@/app/patients/_components/PatientForm";
import { createPatient } from "@/app/lib/api/patients";

export default function PatientNewClient() {
    const router = useRouter();
    const { status, roles } = useAuth();
    const allowed = useMemo(() => can.patientCreate(roles), [roles]);

    useEffect(() => {
        if (status === "authenticated" && !allowed) router.replace("/forbidden");
    }, [status, allowed, router]);

    const [saving, setSaving] = useState(false);

    async function onSubmit(values: PatientFormValues) {
        if (!allowed) return;
        setSaving(true);
        try {
            const created = await createPatient(values);
            router.push(`/patients/${created.id}`);
        } catch (e) {
            alert((e as Error).message);
            setSaving(false);
        }
    }

    if (status === "loading") return <div className="p-6 text-muted-foreground">Verificando sesión…</div>;
    if (status === "authenticated" && !allowed) return null;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Nuevo paciente</h1>
                    <p className="text-sm text-muted-foreground">Crea un registro de paciente.</p>
                </div>
                <Link href="/patients" className="rounded-lg border px-3 py-1.5 hover:bg-muted">← Volver</Link>
            </div>

            <div className="rounded-xl border p-4">
                <PatientForm initial={undefined} submitting={saving} onSubmit={onSubmit} />
            </div>
        </div>
    );
}