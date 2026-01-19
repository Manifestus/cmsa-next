"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";
import { createPreclinic } from "@/app/lib/api/preclinic";
import PreclinicForm, { type PreclinicFormValues } from "@/app/preclinic/_components/PreclinicForm";
import { useQuery } from "@tanstack/react-query";
import { fetchPatients } from "@/app/lib/api/patients";

export default function PreclinicNewPage() {
    const router = useRouter();
    const { status, roles } = useAuth();
    const allowed = useMemo(() => can.preclinicCreate(roles), [roles]);

    useEffect(() => {
        if (status === "authenticated" && !allowed) router.replace("/forbidden");
    }, [status, allowed, router]);

    const patientsQ = useQuery({
        queryKey: ["patients", "for-preclinic"],
        queryFn: () => fetchPatients(50),
        enabled: status === "authenticated" && allowed,
    });

    const [saving, setSaving] = useState(false);

    async function onSubmit(values: PreclinicFormValues) {
        if (!allowed) return;
        setSaving(true);
        try {
            const created = await createPreclinic({
                ...values,
                // server expects ISO; we pass date-only; that’s fine (backend can parse)
            } as any);
            router.push(`/preclinic/${created.id}`);
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
                    <h1 className="text-2xl font-semibold">Nueva preclínica</h1>
                    <p className="text-sm text-muted-foreground">Registrar signos vitales y antecedentes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/preclinic" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                        ← Cancelar
                    </Link>
                </div>
            </div>

            <div className="rounded-xl border p-4">
                {patientsQ.isLoading && <div className="text-muted-foreground">Cargando pacientes…</div>}
                {patientsQ.isError && <div className="text-red-600">{(patientsQ.error as Error)?.message || "Error cargando pacientes"}</div>}
                {patientsQ.data && (
                    <PreclinicForm
                        mode="create"
                        initial={undefined}
                        patients={patientsQ.data.map((p) => ({ id: p.id, mrn: p.mrn, firstName: p.firstName, lastName: p.lastName }))}
                        submitting={saving}
                        onSubmit={onSubmit}
                    />
                )}
            </div>
        </div>
    );
}