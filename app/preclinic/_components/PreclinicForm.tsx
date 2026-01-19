"use client";

import { useMemo, useState } from "react";
import type { Preclinic } from "@/app/lib/api/preclinic";
import { useAuth } from "@/app/lib/auth/useAuth";
import { can } from "@/app/lib/auth/roles";

export type PreclinicFormValues = {
    patientId: string;
    visitDate: string; // yyyy-mm-dd
    bloodPressureSystolic?: number | null;
    bloodPressureDiastolic?: number | null;
    heartRate?: number | null;
    respRate?: number | null;
    temperatureC?: string | null;
    weightKg?: string | null;
    heightCm?: string | null;
    bmi?: string | null;
    chiefComplaint?: string | null;
    currentMedications?: string | null;
    diabetes?: boolean | null;
    hypertension?: boolean | null;
    otherConditions?: string | null;
    allergiesReported?: string | null;
};

type Mode = "create" | "edit";

export default function PreclinicForm({
                                          initial,
                                          onSubmit,
                                          submitting,
                                          mode,
                                          patients, // dropdown list
                                      }: {
    initial?: Partial<Preclinic>;
    submitting?: boolean;
    onSubmit: (values: PreclinicFormValues) => void | Promise<void>;
    mode?: Mode;
    patients: { id: string; mrn: string; firstName: string; lastName: string }[];
}) {
    const { roles } = useAuth();

    const inferredMode: Mode = useMemo(() => {
        if (mode) return mode;
        return initial?.id ? "edit" : "create";
    }, [mode, initial?.id]);

    const canSubmit = useMemo(() => {
        return inferredMode === "create"
            ? can.preclinicCreate(roles)
            : can.preclinicEdit(roles);
    }, [inferredMode, roles]);

    const disabled = submitting || !canSubmit;

    const [vals, setVals] = useState<PreclinicFormValues>({
        patientId: initial?.patientId ?? "",
        visitDate: initial?.visitDate ? initial.visitDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        bloodPressureSystolic: initial?.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: initial?.bloodPressureDiastolic ?? null,
        heartRate: initial?.heartRate ?? null,
        respRate: initial?.respRate ?? null,
        temperatureC: initial?.temperatureC ?? null,
        weightKg: initial?.weightKg ?? null,
        heightCm: initial?.heightCm ?? null,
        bmi: initial?.bmi ?? null,
        chiefComplaint: initial?.chiefComplaint ?? null,
        currentMedications: initial?.currentMedications ?? null,
        diabetes: initial?.diabetes ?? null,
        hypertension: initial?.hypertension ?? null,
        otherConditions: initial?.otherConditions ?? null,
        allergiesReported: initial?.allergiesReported ?? null,
    });

    function set<K extends keyof PreclinicFormValues>(k: K, v: PreclinicFormValues[K]) {
        setVals((s) => ({ ...s, [k]: v }));
    }

    const roleHint =
        inferredMode === "create"
            ? "Requiere rol: enfermería, doctor, admin o super admin."
            : "Requiere rol: doctor, admin o super admin.";

    return (
        <form
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                onSubmit(vals);
            }}
        >
            {!canSubmit && (
                <div className="lg:col-span-2 rounded-lg border bg-amber-50 text-amber-900 px-4 py-3 text-sm">
                    No tienes permisos para {inferredMode === "create" ? "crear" : "editar"} registros de preclínica. {roleHint}
                </div>
            )}

            {/* Patient & Visit */}
            <Select
                label="Paciente"
                value={vals.patientId}
                onChange={(v) => set("patientId", v)}
                disabled={disabled || inferredMode === "edit"} // no changing patient on edit
                options={[
                    { value: "", label: "Selecciona un paciente…" },
                    ...patients.map((p) => ({
                        value: p.id,
                        label: `${p.mrn} — ${p.firstName} ${p.lastName}`,
                    })),
                ]}
                required
            />
            <Input
                label="Fecha de visita"
                type="date"
                value={vals.visitDate}
                onChange={(v) => set("visitDate", v)}
                disabled={disabled}
                required
            />

            {/* Vitals */}
            <NumberInput
                label="PA Sistólica (mmHg)"
                value={vals.bloodPressureSystolic}
                onChange={(v) => set("bloodPressureSystolic", v)}
                disabled={disabled}
            />
            <NumberInput
                label="PA Diastólica (mmHg)"
                value={vals.bloodPressureDiastolic}
                onChange={(v) => set("bloodPressureDiastolic", v)}
                disabled={disabled}
            />
            <NumberInput
                label="Frecuencia cardiaca (lpm)"
                value={vals.heartRate}
                onChange={(v) => set("heartRate", v)}
                disabled={disabled}
            />
            <NumberInput
                label="Frecuencia respiratoria (rpm)"
                value={vals.respRate}
                onChange={(v) => set("respRate", v)}
                disabled={disabled}
            />
            <Input
                label="Temperatura (°C)"
                value={vals.temperatureC ?? ""}
                onChange={(v) => set("temperatureC", v || null)}
                disabled={disabled}
                placeholder="36.6"
            />
            <Input
                label="Peso (kg)"
                value={vals.weightKg ?? ""}
                onChange={(v) => set("weightKg", v || null)}
                disabled={disabled}
                placeholder="70.0"
            />
            <Input
                label="Talla (cm)"
                value={vals.heightCm ?? ""}
                onChange={(v) => set("heightCm", v || null)}
                disabled={disabled}
                placeholder="170.0"
            />
            <Input
                label="IMC"
                value={vals.bmi ?? ""}
                onChange={(v) => set("bmi", v || null)}
                disabled={disabled}
                placeholder="24.2"
            />

            {/* Clinical fields */}
            <TextArea
                label="Motivo de consulta"
                value={vals.chiefComplaint ?? ""}
                onChange={(v) => set("chiefComplaint", v || null)}
                disabled={disabled}
            />
            <TextArea
                label="Medicamentos actuales"
                value={vals.currentMedications ?? ""}
                onChange={(v) => set("currentMedications", v || null)}
                disabled={disabled}
            />
            <Checkbox
                label="Diabetes"
                checked={!!vals.diabetes}
                onChange={(v) => set("diabetes", v)}
                disabled={disabled}
            />
            <Checkbox
                label="Hipertensión"
                checked={!!vals.hypertension}
                onChange={(v) => set("hypertension", v)}
                disabled={disabled}
            />
            <TextArea
                label="Otras condiciones"
                value={vals.otherConditions ?? ""}
                onChange={(v) => set("otherConditions", v || null)}
                disabled={disabled}
            />
            <TextArea
                label="Alergias reportadas"
                value={vals.allergiesReported ?? ""}
                onChange={(v) => set("allergiesReported", v || null)}
                disabled={disabled}
            />

            <div className="lg:col-span-2 flex items-center gap-2 mt-2">
                <button
                    type="submit"
                    disabled={disabled}
                    className="rounded-lg bg-primary text-primary-foreground px-4 py-2 disabled:opacity-60"
                >
                    {submitting ? "Guardando…" : "Guardar"}
                </button>
            </div>
        </form>
    );
}

function Input({
                   label, value, onChange, required, type = "text", disabled, placeholder,
               }: {
    label: string; value: string; onChange: (v: string) => void;
    required?: boolean; type?: string; disabled?: boolean; placeholder?: string;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <input
                className="rounded-xl border px-3 py-2 disabled:bg-muted/40 disabled:text-muted-foreground"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                type={type}
                disabled={disabled}
                placeholder={placeholder}
            />
        </label>
    );
}

function NumberInput({
                         label, value, onChange, disabled,
                     }: {
    label: string; value?: number | null; onChange: (v: number | null) => void; disabled?: boolean;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <input
                className="rounded-xl border px-3 py-2 disabled:bg-muted/40 disabled:text-muted-foreground"
                value={value ?? ""}
                onChange={(e) => {
                    const t = e.target.value.trim();
                    if (t === "") onChange(null);
                    else onChange(Number.isNaN(Number(t)) ? null : Number(t));
                }}
                type="number"
                step="1"
                disabled={disabled}
            />
        </label>
    );
}

function TextArea({
                      label, value, onChange, disabled,
                  }: {
    label: string; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
    return (
        <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <textarea
                className="rounded-xl border px-3 py-2 disabled:bg-muted/40 disabled:text-muted-foreground"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                disabled={disabled}
            />
        </label>
    );
}

function Select({
                    label, value, onChange, options, disabled, required,
                }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
    required?: boolean;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <select
                className="rounded-xl border px-3 py-2 disabled:bg-muted/40 disabled:text-muted-foreground"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                required={required}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </label>
    );
}

function Checkbox({
                      label, checked, onChange, disabled,
                  }: {
    label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
    return (
        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                className="h-4 w-4"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <span className="text-sm">{label}</span>
        </label>
    );
}