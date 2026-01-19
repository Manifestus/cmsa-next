"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Fuse from "fuse.js";
import {
    fetchInvoices,
    type Invoice,
    type InvoiceStatus,
} from "@/app/lib/api/invoices";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";
import PaymentsDialog from "./PaymentsDialog";

function patientName(i: Invoice) {
    const p = i.patient;
    if (!p) return "—";
    return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "—";
}

export default function InvoicesDashboard() {
    const { roles } = useAuth();
    const allowed = can.invoicesArea(roles);

    // --- filters
    const [status, setStatus] = useState<InvoiceStatus | "">("");
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");

    const q = useQuery({
        queryKey: ["invoices", { status, from, to, limit: 50 }],
        queryFn: () => fetchInvoices({ status: status || undefined, from: from || undefined, to: to || undefined, limit: 50 }),
        enabled: allowed,
    });

    const [term, setTerm] = useState("");
    const [paying, setPaying] = useState<Invoice | null>(null);

    const fuse = useMemo(() => {
        const items = q.data ?? [];
        return new Fuse(items, {
            keys: [
                { name: "invoiceNo", weight: 0.8 },
                { name: "patient.firstName", weight: 0.5 },
                { name: "patient.lastName", weight: 0.5 },
                { name: "status", weight: 0.3 },
            ],
            threshold: 0.35,
            ignoreLocation: true,
        });
    }, [q.data]);

    const filtered: Invoice[] = useMemo(() => {
        if (!q.data) return [];
        if (!term.trim()) return q.data;
        return fuse.search(term).map((r) => r.item);
    }, [q.data, fuse, term]);

    if (!allowed) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold mb-2">Acceso restringido</h1>
                <p className="text-sm text-muted-foreground">
                    Tu cuenta no tiene permisos para ver facturas (requiere: cajero o admin/super
                    admin).
                </p>
            </div>
        );
    }

    function onPrint(inv: Invoice) {
        // Assumes a future backend route; harmless if not present yet.
        const url = `/api/proxy/invoices/${encodeURIComponent(inv.id)}/pdf`;
        window.open(url, "_blank");
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Top bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 flex flex-col gap-2 sm:flex-row">
                    <input
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Buscar por número de factura, paciente o estado…"
                        className="w-full sm:max-w-sm rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            title="Estado"
                        >
                            <option value="">Todos los estados</option>
                            <option value="draft">Borrador</option>
                            <option value="posted">Emitida</option>
                            <option value="void">Anulada</option>
                        </select>

                        <input
                            type="date"
                            className="rounded-xl border px-3 py-2"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            title="Desde"
                        />
                        <input
                            type="date"
                            className="rounded-xl border px-3 py-2"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            title="Hasta"
                        />
                    </div>
                </div>

                {/* Create goes to caja/POS */}
                <Link
                    href="/cashier"
                    className="rounded-xl bg-primary text-primary-foreground px-4 py-2 hover:opacity-90"
                >
                    + Nueva factura
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-auto rounded-xl border">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="text-left px-4 py-3 font-medium">N.º</th>
                        <th className="text-left px-4 py-3 font-medium">Paciente</th>
                        <th className="text-left px-4 py-3 font-medium">Fecha</th>
                        <th className="text-left px-4 py-3 font-medium">Estado</th>
                        <th className="text-right px-4 py-3 font-medium">Total</th>
                        <th className="text-right px-4 py-3 font-medium">Acciones</th>
                    </tr>
                    </thead>

                    <tbody>
                    {q.isLoading && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                Cargando facturas…
                            </td>
                        </tr>
                    )}

                    {!q.isLoading && filtered.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                {term ? "No hay resultados para tu búsqueda." : "No hay facturas registradas."}
                            </td>
                        </tr>
                    )}

                    {filtered.map((inv) => (
                        <tr key={inv.id} className="border-t">
                            <td className="px-4 py-3">{inv.invoiceNo}</td>
                            <td className="px-4 py-3">{patientName(inv)}</td>
                            <td className="px-4 py-3">
                                {inv.invoiceAt ? new Date(inv.invoiceAt).toLocaleString() : "—"}
                            </td>
                            <td className="px-4 py-3">
                                <InvoiceStatusBadge status={inv.status} />
                            </td>
                            <td className="px-4 py-3 text-right">
                                {Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/invoice/${inv.id}`}
                                        className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                                    >
                                        Ver
                                    </Link>

                                    {/* PDF */}
                                    <button
                                        onClick={() => onPrint(inv)}
                                        className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                                        title="Descargar PDF"
                                    >
                                        PDF
                                    </button>

                                    {/* Pagos */}
                                    <button
                                        onClick={() => setPaying(inv)}
                                        className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                                        title="Registrar pago"
                                    >
                                        Pago
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Payments dialog (stubbed callback) */}
            {paying && (
                <PaymentsDialog
                    invoice={paying}
                    onClose={() => setPaying(null)}
                    onConfirm={(payload: any) => {
                        // Stub: plug into your payments endpoint later
                        console.log("⏺️ payment submit", { invoiceId: paying.id, ...payload });
                        setPaying(null);
                        // Optionally refetch invoices here
                        // void q.refetch();
                    }}
                />
            )}
        </div>
    );
}