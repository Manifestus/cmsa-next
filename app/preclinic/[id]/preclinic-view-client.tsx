"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";
import { getPreclinic } from "@/app/lib/api/preclinic";

export default function PreclinicViewClient({ id }: { id: string }) {
    const router = useRouter();
    const { status, roles } = useAuth();
    const allowed = useMemo(() => can.preclinicView(roles), [roles]);

    useEffect(() => {
        if (status === "authenticated" && !allowed) router.replace("/forbidden");
    }, [status, allowed, router]);

    const q = useQuery({
        queryKey: ["preclinic", id],
        queryFn: () => getPreclinic(id),
        enabled: status === "authenticated" && allowed && !!id,
    });

    if (status === "loading") return <div className="p-6 text-muted-foreground">Verificando sesión…</div>;
    if (status === "authenticated" && !allowed) return null;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Preclínica</h1>
                    <p className="text-sm text-muted-foreground">Detalles del registro.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/preclinic" className="rounded-lg border px-3 py-1.5 hover:bg-muted">← Volver</Link>
                    {can.preclinicEdit(roles) && (
                        <Link href={`/preclinic/${id}/edit`} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                            Editar
                        </Link>
                    )}
                </div>
            </div>

            <div className="rounded-xl border p-4">
                {q.isLoading && <div className="text-muted-foreground">Cargando…</div>}
                {q.isError && <div className="text-red-600">{(q.error as Error)?.message || "No se pudo cargar"}</div>}
                {q.data && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        <Field label="Fecha">{q.data.visitDate ? new Date(q.data.visitDate).toLocaleString() : "—"}</Field>
                        <Field label="Paciente">
                            {q.data.patient ? `${q.data.patient.firstName ?? ""} ${q.data.patient.lastName ?? ""}`.trim() : "—"}
                        </Field>
                        <Field label="MRN">{q.data.patient?.mrn ?? "—"}</Field>
                        <Field label="PA">
                            {q.data.bloodPressureSystolic && q.data.bloodPressureDiastolic
                                ? `${q.data.bloodPressureSystolic}/${q.data.bloodPressureDiastolic}`
                                : "—"}
                        </Field>
                        <Field label="FC">{q.data.heartRate ?? "—"}</Field>
                        <Field label="FR">{q.data.respRate ?? "—"}</Field>
                        <Field label="Temp (°C)">{q.data.temperatureC ?? "—"}</Field>
                        <Field label="Peso (kg)">{q.data.weightKg ?? "—"}</Field>
                        <Field label="Talla (cm)">{q.data.heightCm ?? "—"}</Field>
                        <Field label="IMC">{q.data.bmi ?? "—"}</Field>
                        <Field label="Motivo">{q.data.chiefComplaint ?? "—"}</Field>
                        <Field label="Medicamentos">{q.data.currentMedications ?? "—"}</Field>
                        <Field label="Diabetes">{q.data.diabetes ? "Sí" : "No"}</Field>
                        <Field label="Hipertensión">{q.data.hypertension ? "Sí" : "No"}</Field>
                        <Field label="Otras condiciones">{q.data.otherConditions ?? "—"}</Field>
                        <Field label="Alergias">{q.data.allergiesReported ?? "—"}</Field>
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="text-sm">{children}</span>
        </div>
    );
}