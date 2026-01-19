// app/invoice/[id]/invoice-view-client.tsx
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";
import { getInvoice, type Invoice } from "@/app/lib/api/invoices";
import InvoiceStatusBadge from "../_components/InvoiceStatusBadge";

export default function InvoiceViewClient({ id }: { id: string }) {
    const router = useRouter();
    const { roles } = useAuth();
    const allowed = useMemo(() => can.invoicesArea(roles), [roles]);

    const q = useQuery({
        queryKey: ["invoice", id],
        queryFn: () => getInvoice(id),
        enabled: allowed && !!id,
    });

    if (!allowed) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold mb-2">Acceso restringido</h1>
                <p className="text-sm text-muted-foreground">
                    Tu cuenta no tiene permisos para ver facturas (requiere: cajero o admin/super admin).
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Factura</h1>
                    <p className="text-sm text-muted-foreground">Detalle de la factura y sus líneas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/invoices" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                        ← Regresar
                    </Link>
                    {/* Future: actions (Imprimir, Anular, etc.) based on status & roles */}
                </div>
            </div>

            <div className="rounded-xl border p-4">
                {q.isLoading && <div className="text-muted-foreground">Cargando…</div>}
                {q.isError && (
                    <div className="text-red-600">{(q.error as Error)?.message || "No se pudo cargar"}</div>
                )}
                {q.data && <InvoiceBody inv={q.data} />}
            </div>
        </div>
    );
}

function InvoiceBody({ inv }: { inv: Invoice }) {
    return (
        <div className="space-y-6">
            {/* Top meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="N.º" value={inv.invoiceNo} />
                <Field
                    label="Fecha"
                    value={inv.invoiceAt ? new Date(inv.invoiceAt).toLocaleString() : "—"}
                />
                <Field label="Estado" value={<InvoiceStatusBadge status={inv.status} />} />
                <Field label="Paciente" value={inv.patient ? `${inv.patient.firstName ?? ""} ${inv.patient.lastName ?? ""}`.trim() : "—"} />
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Field label="Subtotal" value={formatMoney(inv.subtotal)} />
                <Field label="Descuento" value={formatMoney(inv.discountTotal)} />
                <Field label="Impuesto" value={formatMoney(inv.taxTotal)} />
                <Field label="Total" value={<strong>{formatMoney(inv.total)}</strong>} />
            </div>

            {/* Lines */}
            <div className="rounded-lg border overflow-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="text-left px-4 py-3 font-medium">#</th>
                        <th className="text-left px-4 py-3 font-medium">Descripción</th>
                        <th className="text-right px-4 py-3 font-medium">Cant.</th>
                        <th className="text-right px-4 py-3 font-medium">P. Unit.</th>
                        <th className="text-right px-4 py-3 font-medium">Desc. %</th>
                        <th className="text-right px-4 py-3 font-medium">Impuesto %</th>
                        <th className="text-right px-4 py-3 font-medium">Total línea</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(inv.lines ?? []).length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                Sin líneas.
                            </td>
                        </tr>
                    )}

                    {(inv.lines ?? []).map((ln) => (
                        <tr key={ln.id} className="border-t">
                            <td className="px-4 py-3">{ln.lineNo}</td>
                            <td className="px-4 py-3">{ln.description}</td>
                            <td className="px-4 py-3 text-right">{Number(ln.qty).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(ln.unitPrice)}</td>
                            <td className="px-4 py-3 text-right">{Number(ln.discountPct).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{Number(ln.taxRatePct).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(ln.lineTotal)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="text-sm">{value || "—"}</span>
        </div>
    );
}

function formatMoney(n?: string | number | null) {
    if (n == null) return "—";
    const val = typeof n === "string" ? Number(n) : n;
    if (Number.isNaN(val)) return String(n);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}