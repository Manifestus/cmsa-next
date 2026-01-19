// app/invoices/_components/PaymentsDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createInvoicePayment } from "@/app/lib/api/invoices";

export default function PaymentsDialog({ invoiceId, onSuccess }: { invoiceId: string; onSuccess?: () => void }) {
    const [open, setOpen] = React.useState(false);
    const [method, setMethod] = React.useState<"cash" | "card" | "transfer" | "other">("cash");
    const [amount, setAmount] = React.useState<string>("");
    const [currency, setCurrency] = React.useState<string>("HNL");
    const [reference, setReference] = React.useState<string>("");
    const [loading, setLoading] = React.useState(false);

    async function submit() {
        if (!amount || Number(amount) <= 0) return;
        setLoading(true);
        try {
            await createInvoicePayment(invoiceId, {
                method,
                amount: Number(amount),
                currency,
                reference: reference || undefined,
            });
            setOpen(false);
            onSuccess?.();
            // reset
            setAmount("");
            setReference("");
            setMethod("cash");
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">Registrar pago</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar pago</DialogTitle>
                </DialogHeader>

                <div className="grid gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Método</span>
                        <select className="border rounded px-3 py-2" value={method} onChange={(e) => setMethod(e.target.value as any)}>
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="transfer">Transferencia</option>
                            <option value="other">Otro</option>
                        </select>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Monto</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="border rounded px-3 py-2"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Moneda</span>
                        <input className="border rounded px-3 py-2" value={currency} onChange={(e) => setCurrency(e.target.value)} />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Referencia (opcional)</span>
                        <input className="border rounded px-3 py-2" value={reference} onChange={(e) => setReference(e.target.value)} />
                    </label>
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={submit} disabled={loading || !amount || Number(amount) <= 0}>
                        {loading ? "Guardando…" : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}