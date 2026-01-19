"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";
import { getPatient, type Patient } from "@/app/lib/api/patients";

export default function PatientViewClient({ id }: { id: string }) {
    const router = useRouter();
    const { status, roles } = useAuth(); // roles from /api/me

    const canView = useMemo(() => can.patientView(roles), [roles]);

    useEffect(() => {
        if (status === "authenticated" && !canView) {
            router.replace("/forbidden");
        }
    }, [status, canView, router]);

    const q = useQuery({
        queryKey: ["patient", id],
        queryFn: () => getPatient(id),
        enabled: status === "authenticated" && canView && !!id,
    });

    const [deleting, setDeleting] = useState(false);
    async function onDelete() {
        if (!can.patientDelete(roles)) return;
        if (!confirm("Delete this patient? This cannot be undone.")) return;
        setDeleting(true);
        try {
            // ✅ Correct: UI calls /api/proxy/... (proxy auto-adds /api to upstream)
            const res = await fetch(`/api/proxy/patients/${encodeURIComponent(id)}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                alert(`Delete failed (${res.status}): ${text}`);
                setDeleting(false);
                return;
            }
            router.push("/patients");
        } finally {
            setDeleting(false);
        }
    }

    if (status === "loading") {
        return <div className="p-6 text-muted-foreground">Checking session…</div>;
    }
    if (status === "authenticated" && !canView) {
        return null; // redirected by effect
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Patient</h1>
                    <p className="text-sm text-muted-foreground">View patient details and history.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/patients" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                        ← Back
                    </Link>

                    {can.patientEdit(roles) && (
                        <Link
                            href={`/patients/${id}/edit`}
                            className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                        >
                            Edit
                        </Link>
                    )}

                    {can.patientDelete(roles) && (
                        <button
                            onClick={onDelete}
                            disabled={deleting}
                            className="rounded-lg border px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="rounded-xl border p-4">
                {q.isLoading && <div className="text-muted-foreground">Loading patient…</div>}
                {q.isError && (
                    <div className="text-red-600">
                        {(q.error as Error)?.message || "Failed to load"}
                    </div>
                )}
                {q.data && <PatientFields p={q.data} />}
            </div>
        </div>
    );
}

function PatientFields({ p }: { p: Patient }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <Field label="MRN" value={p.mrn} />
            <Field label="Name" value={`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()} />
            <Field label="Sex" value={p.sex ?? "—"} />
            <Field label="DOB" value={p.dob ? new Date(p.dob).toLocaleDateString() : "—"} />
            <Field label="Phone" value={p.phone ?? "—"} />
            <Field label="Email" value={p.email ?? "—"} />
            <Field label="Address" value={p.address ?? "—"} />
            <Field label="City" value={p.city ?? "—"} />
            <Field label="Region" value={p.region ?? "—"} />
            <Field label="Country" value={p.country ?? "—"} />
            <Field label="Created" value={p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"} />
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="text-sm">{value || "—"}</span>
        </div>
    );
}