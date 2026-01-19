"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth/useAuth";
import { fetchPreclinics, type Preclinic } from "@/app/lib/api/preclinic";

// Inline role guard (to avoid needing to change your shared roles helper)
function canCreatePreclinic(roles?: string[]) {
    const have = new Set((roles ?? []).map((r) => r.toLowerCase()));
    return ["frontdesk", "doctor", "admin", "super_admin"].some((r) => have.has(r));
}

export default function PreclinicDashboard() {
    const { roles, status } = useAuth();
    const [term, setTerm] = useState("");

    const q = useQuery({
        queryKey: ["preclinics"],
        queryFn: () => fetchPreclinics(50),
        enabled: status === "authenticated",
    });

    // very light client-side filter by chiefComplaint (and basic vitals)
    const filtered = useMemo(() => {
        const items = q.data ?? [];
        const t = term.trim().toLowerCase();
        if (!t) return items;
        return items.filter((p) => {
            const fields = [
                p.chiefComplaint ?? "",
                p.currentMedications ?? "",
                p.otherConditions ?? "",
                p.allergiesReported ?? "",
            ].join(" ").toLowerCase();
            return fields.includes(t);
        });
    }, [q.data, term]);

    const canCreate = useMemo(() => canCreatePreclinic(roles), [roles]);

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <input
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Buscar por motivo, medicamentos, condiciones, alergias…"
                        className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>

                {/* Restricted Add button */}
                {canCreate ? (
                    <Link
                        href="/preclinic/new"
                        className="rounded-xl bg-primary text-primary-foreground px-4 py-2 hover:opacity-90"
                    >
                        + Nueva preclínica
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled
                        title="Requiere rol: recepción, doctor, admin o super admin."
                        className="rounded-xl bg-primary text-primary-foreground px-4 py-2 opacity-60 cursor-not-allowed"
                    >
                        + Nueva preclínica
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-auto rounded-xl border">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="text-left px-4 py-3 font-medium">Fecha</th>
                        <th className="text-left px-4 py-3 font-medium">Motivo</th>
                        <th className="text-left px-4 py-3 font-medium">TA (sis/dia)</th>
                        <th className="text-left px-4 py-3 font-medium">FC</th>
                        <th className="text-left px-4 py-3 font-medium">FR</th>
                        <th className="text-left px-4 py-3 font-medium">Temp °C</th>
                        <th className="text-left px-4 py-3 font-medium">IMC</th>
                        <th className="text-right px-4 py-3 font-medium">Acciones</th>
                    </tr>
                    </thead>

                    <tbody>
                    {q.isLoading && (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                Cargando preclínica…
                            </td>
                        </tr>
                    )}

                    {!q.isLoading && filtered.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                {term ? "Sin resultados para tu búsqueda." : "No hay registros de preclínica."}
                            </td>
                        </tr>
                    )}

                    {filtered.map((r) => (
                        <tr key={r.id} className="border-t">
                            <td className="px-4 py-3">
                                {r.visitDate ? new Date(r.visitDate).toLocaleString() : "—"}
                            </td>
                            <td className="px-4 py-3">{r.chiefComplaint ?? "—"}</td>
                            <td className="px-4 py-3">
                                {r.bloodPressureSystolic ?? "—"}/{r.bloodPressureDiastolic ?? "—"}
                            </td>
                            <td className="px-4 py-3">{r.heartRate ?? "—"}</td>
                            <td className="px-4 py-3">{r.respRate ?? "—"}</td>
                            <td className="px-4 py-3">{r.temperatureC ?? "—"}</td>
                            <td className="px-4 py-3">{r.bmi ?? "—"}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/preclinic/${r.id}`}
                                        className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                                        title="Ver"
                                    >
                                        Ver
                                    </Link>
                                    {/* Edit routes/permissions can be added here if needed */}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}