"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { fetchPatients, type Patient } from "@/app/lib/api/patients";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth/useAuth";   // ✅ useAuth instead of useSession
import { can } from "@/app/lib/auth/roles";

function fullName(p: Patient) {
    return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
}

export default function PatientDashboard() {
    const { status, roles } = useAuth(); // ✅ authoritative roles from /api/me

    const q = useQuery({
        queryKey: ["patients"],
        queryFn: () => fetchPatients(50), // backend cap ~50
        enabled: status === "authenticated",
    });

    const [term, setTerm] = useState("");

    const fuse = useMemo(() => {
        const items = q.data ?? [];
        return new Fuse(items, {
            keys: [
                { name: "mrn", weight: 0.5 },
                { name: "firstName", weight: 0.7 },
                { name: "lastName", weight: 0.7 },
                { name: "email", weight: 0.4 },
                { name: "phone", weight: 0.4 },
            ],
            threshold: 0.35,
            ignoreLocation: true,
        });
    }, [q.data]);

    const filtered: Patient[] = useMemo(() => {
        if (!q.data) return [];
        if (!term.trim()) return q.data;
        return fuse.search(term).map((r) => r.item);
    }, [q.data, fuse, term]);

    async function onDelete(id: string) {
        if (!confirm("¿Eliminar este paciente?")) return;

        const res = await fetch(`/api/proxy/patients/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) {
            const txt = await res.text();
            alert(`Error al eliminar (${res.status}): ${txt}`);
            return;
        }
        await q.refetch();
    }

    const canCreate = useMemo(() => can.patientCreate(roles), [roles]);

    if (status === "loading") {
        return <div className="p-6 text-muted-foreground">Verificando sesión…</div>;
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <input
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Buscar por nombre, MRN, correo, teléfono…"
                        className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>

                {/* Restricted Add Patient button */}
                {canCreate ? (
                    <Link
                        href="/patients/new"
                        className="rounded-xl bg-primary text-primary-foreground px-4 py-2 hover:opacity-90"
                    >
                        + Nuevo paciente
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled
                        title="Requiere rol: recepcionista, enfermería, doctor, admin o super admin."
                        className="rounded-xl bg-primary text-primary-foreground px-4 py-2 opacity-60 cursor-not-allowed"
                    >
                        + Nuevo paciente
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-auto rounded-xl border">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="text-left px-4 py-3 font-medium">MRN</th>
                        <th className="text-left px-4 py-3 font-medium">Nombre</th>
                        <th className="text-left px-4 py-3 font-medium">Sexo</th>
                        <th className="text-left px-4 py-3 font-medium">F. Nac.</th>
                        <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                        <th className="text-left px-4 py-3 font-medium">Correo</th>
                        <th className="text-right px-4 py-3 font-medium">Acciones</th>
                    </tr>
                    </thead>

                    <tbody>
                    {q.isLoading && (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                Cargando pacientes…
                            </td>
                        </tr>
                    )}

                    {!q.isLoading && filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                {term ? "No hay resultados para tu búsqueda." : "No hay pacientes registrados."}
                            </td>
                        </tr>
                    )}

                    {filtered.map((p) => (
                        <tr key={p.id} className="border-t">
                            <td className="px-4 py-3">{p.mrn}</td>
                            <td className="px-4 py-3">{fullName(p)}</td>
                            <td className="px-4 py-3">{p.sex ?? "—"}</td>
                            <td className="px-4 py-3">
                                {p.dob ? new Date(p.dob).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-4 py-3">{p.phone ?? "—"}</td>
                            <td className="px-4 py-3">{p.email ?? "—"}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/patients/${p.id}`}
                                        className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                                        title="Ver"
                                    >
                                        Ver
                                    </Link>

                                    {can.patientEdit(roles) && (
                                        <Link
                                            href={`/patients/${p.id}/edit`}
                                            className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                                            title="Editar"
                                        >
                                            Editar
                                        </Link>
                                    )}

                                    {can.patientDelete(roles) && (
                                        <button
                                            onClick={() => onDelete(p.id)}
                                            className="rounded-lg border px-3 py-1.5 text-red-600 hover:bg-red-50"
                                            title="Eliminar"
                                        >
                                            Eliminar
                                        </button>
                                    )}
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