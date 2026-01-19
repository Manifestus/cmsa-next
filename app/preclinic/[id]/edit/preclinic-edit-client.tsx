"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";
import { getPreclinic, updatePreclinic } from "@/app/lib/api/preclinic";
import PreclinicForm, { type PreclinicFormValues } from "@/app/preclinic/_components/PreclinicForm";

export default function PreclinicEditClient({ id }: { id: string }) {
    const router = useRouter();
    const { status, roles } = useAuth();
    const allowed = useMemo(() => can.preclinicEdit(roles), [roles]);

    useEffect(() => {
        if (status === "authenticated" && !allowed) router.replace("/forbidden");
    }, [status, allowed, router]);

    const q = useQuery({
        queryKey: ["preclinic", id],
        queryFn: () => getPreclinic(id),
        enabled: status === "authenticated" && allowed && !!id,
    });

    const [saving, setSaving] = useState(false);

    async function onSubmit(values: PreclinicFormValues) {
        if (!allowed) return;
        setSaving(true);
        try {
            await updatePreclinic(id, values as any);
            router.push(`/preclinic/${id}`);
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
                    <h1 className="text-2xl font-semibold">Editar preclínica</h1>
                    <p className="text-sm text-muted-foreground">Actualiza los datos registrados.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/preclinic/${id}`} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                        ← Cancelar
                    </Link>
                </div>
            </div>

            <div className="rounded-xl border p-4">
                {q.isLoading && <div className="text-muted-foreground">Cargando…</div>}
                {q.isError && <div className="text-red-600">{(q.error as Error)?.message || "No se pudo cargar"}</div>}
                {q.data && (
                    <PreclinicForm
                        mode="edit"
                        initial={q.data}
                        patients={[
                            {
                                id: q.data.patient?.id ?? q.data.patientId,
                                mrn: q.data.patient?.mrn ?? "—",
                                firstName: q.data.patient?.firstName ?? "",
                                lastName: q.data.patient?.lastName ?? "",
                            },
                        ]}
                        submitting={saving}
                        onSubmit={onSubmit}
                    />
                )}
            </div>
        </div>
    );
}