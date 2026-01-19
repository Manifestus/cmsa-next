// app/cashier/_components/OpenSessionButton.tsx
"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchRegisters, type CashRegister } from "@/app/lib/api/registers";
import { ChevronsUpDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function OpenSessionButton() {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Abrir sesión de caja</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Abrir sesión de caja</DialogTitle>
                </DialogHeader>
                <OpenSessionForm onDone={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

function OpenSessionForm({ onDone }: { onDone: () => void }) {
    const qRegs = useQuery({
        queryKey: ["registers"],
        queryFn: () => fetchRegisters(200),
    });

    const [register, setRegister] = React.useState<CashRegister | null>(null);
    const [openingFloat, setOpeningFloat] = React.useState<string>("");
    const [note, setNote] = React.useState<string>("");

    const disabled = qRegs.isLoading || !register || !openingFloat;

    const mut = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/proxy/cash/sessions/open", {
                method: "POST",
                credentials: "include",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    registerId: register?.id,
                    openingFloat: Number(openingFloat),
                    // `note` is local-only right now; omit or keep if you extend your Deno route
                }),
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`No se pudo abrir la sesión (${res.status}) ${txt}`);
            }
            return res.json();
        },
        onSuccess: () => {
            onDone();
        },
    });

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                if (!disabled) mut.mutate();
            }}
        >
            {/* Register combobox */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Caja</label>
                <RegisterCombobox
                    value={register}
                    onChange={setRegister}
                    registers={qRegs.data ?? []}
                    loading={qRegs.isLoading}
                />
                <p className="text-xs text-muted-foreground">
                    Selecciona la caja/registradora donde aperturar la sesión.
                </p>
            </div>

            {/* Opening float */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Fondo inicial</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={openingFloat}
                    onChange={(e) => setOpeningFloat(e.target.value)}
                    className="rounded-xl border px-3 py-2"
                    placeholder="0.00"
                />
            </div>

            {/* Optional note (UI only for now) */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Nota (opcional)</label>
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="rounded-xl border px-3 py-2"
                    placeholder="Observaciones…"
                />
            </div>

            <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
                <Button type="submit" disabled={disabled || mut.isPending}>
                    {mut.isPending ? "Abriendo…" : "Abrir sesión"}
                </Button>
            </DialogFooter>
        </form>
    );
}

function RegisterCombobox({
                              value, onChange, registers, loading,
                          }: {
    value: CashRegister | null;
    onChange: (r: CashRegister | null) => void;
    registers: CashRegister[];
    loading?: boolean;
}) {
    const [open, setOpen] = React.useState(false);
    const label = value ? `${value.name}${value.location?.name ? ` — ${value.location?.name}` : ""}` : "Seleccionar…";

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
                        {!loading && registers.length === 0 && <CommandEmpty>Sin resultados.</CommandEmpty>}
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
                                        <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
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