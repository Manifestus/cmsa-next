'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandGroup,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import {
    useOpenSessions,
    useOpenSession,
    useCashSummary,
    useCreateMovement,
} from "@/app/lib/queries";

import { fetchRegisters, type CashRegister } from "@/app/lib/api/registers";

export default function CashierPage() {
    const { data } = useOpenSessions();
    const open = useOpenSession();
    const createMov = useCreateMovement();

    // pick first open session (your API sometimes returns {items} or a flat array)
    const session = (data as any)?.items?.[0] ?? (data as any)?.[0];

    const summary = useCashSummary(session?.id);

    return (
        <div className="p-6 space-y-6">
            {/* Apertura de sesión */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="text-lg font-semibold">Apertura de caja</div>
                    <OpenSessionBar
                        onOpen={(payload) => open.mutate(payload)}
                        isOpening={open.isPending}
                    />
                    {session && (
                        <div className="text-sm text-muted-foreground">
                            Sesión abierta actual: <span className="font-mono">{session.id}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Movimiento rápido */}
            {session && (
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="text-lg font-semibold">Movimiento rápido</div>
                        <MovementForm
                            sessionId={session.id}
                            onSubmit={(p) => createMov.mutate(p)}
                            submitting={createMov.isPending}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Resumen */}
            {summary.data && (
                <Card>
                    <CardContent className="p-4">
                        <div className="text-lg font-semibold mb-3">Resumen de caja</div>
                        <pre className="text-sm">{JSON.stringify(summary.data, null, 2)}</pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/* ---------- Open session bar with combobox ---------- */

function OpenSessionBar({
                            onOpen,
                            isOpening,
                        }: {
    onOpen: (p: { registerId: string; openingFloat: number }) => void;
    isOpening?: boolean;
}) {
    const regs = useQuery({
        queryKey: ["registers"],
        queryFn: () => fetchRegisters(200),
    });

    const [selected, setSelected] = useState<CashRegister | null>(null);
    const [openingFloat, setOpeningFloat] = useState<string>("");

    const disabled =
        regs.isLoading || !selected || !openingFloat || Number(openingFloat) < 0;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 min-w-[260px]">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Caja
                </label>
                <RegisterCombobox
                    value={selected}
                    onChange={setSelected}
                    registers={regs.data ?? []}
                    loading={regs.isLoading}
                />
            </div>

            <div className="sm:w-48">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Fondo inicial
                </label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={openingFloat}
                    onChange={(e) => setOpeningFloat(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2"
                />
            </div>

            <div className="sm:w-auto">
                <label className="invisible block text-xs">.</label>
                <Button
                    className="w-full"
                    disabled={disabled || isOpening}
                    onClick={() =>
                        selected &&
                        onOpen({
                            registerId: selected.id,
                            openingFloat: Number(openingFloat),
                        })
                    }
                >
                    {isOpening ? "Abriendo…" : "Abrir sesión"}
                </Button>
            </div>
        </div>
    );
}

function RegisterCombobox({
                              value,
                              onChange,
                              registers,
                              loading,
                          }: {
    value: CashRegister | null;
    onChange: (r: CashRegister | null) => void;
    registers: CashRegister[];
    loading?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const label = value
        ? `${value.name}${value.location?.name ? ` — ${value.location?.name}` : ""}`
        : "Seleccionar…";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className={cn(!value && "text-muted-foreground")}>{label}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                <Command>
                    <CommandInput placeholder="Buscar caja…" />
                    <CommandList>
                        {loading && <CommandEmpty>Cargando…</CommandEmpty>}
                        {!loading && registers.length === 0 && (
                            <CommandEmpty>Sin resultados.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {registers.map((r) => {
                                const lbl = `${r.name}${r.location?.name ? ` — ${r.location?.name}` : ""}`;
                                const selected = value?.id === r.id;
                                return (
                                    <CommandItem
                                        key={r.id}
                                        onSelect={() => {
                                            onChange(r);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {lbl}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

/* ---------- Quick movement form ---------- */

function MovementForm({
                          sessionId,
                          onSubmit,
                          submitting,
                      }: {
    sessionId: string;
    onSubmit: (p: {
        sessionId: string;
        type: "deposit" | "withdrawal" | "adjustment" | "sale";
        amount: number;
        reference?: string;
    }) => void;
    submitting?: boolean;
}) {
    const [type, setType] =
        useState<"deposit" | "withdrawal" | "adjustment" | "sale">("deposit");
    const [amount, setAmount] = useState<string>("");
    const [reference, setReference] = useState<string>("");

    const canSend = !!amount && Number(amount) > 0 && !submitting;

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
                className="border rounded px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
            >
                <option value="deposit">depósito</option>
                <option value="withdrawal">retiro</option>
                <option value="adjustment">ajuste</option>
                <option value="sale">venta</option>
            </select>

            <input
                className="border rounded px-3 py-2"
                placeholder="Monto"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <input
                className="border rounded px-3 py-2"
                placeholder="Referencia (opcional)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
            />

            <Button
                className="sm:ml-2"
                disabled={!canSend}
                onClick={() =>
                    onSubmit({
                        sessionId,
                        type,
                        amount: Number(amount),
                        reference: reference || undefined,
                    })
                }
            >
                {submitting ? "Agregando…" : "Agregar"}
            </Button>
        </div>
    );
}