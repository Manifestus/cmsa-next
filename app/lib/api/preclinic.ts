export type Preclinic = {
    id: string;
    patientId: string;
    visitDate: string;
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
    recordedById: string;
    requestContextId: string;
};

type Page<T> = { items: T[]; nextCursor: string | null };

// List all (optionally filter by patientId)
export async function fetchPreclinics(limit = 50, patientId?: string): Promise<Preclinic[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (patientId) params.set("patientId", patientId);

    const res = await fetch(`/api/proxy/preclinics?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Preclinics fetch failed (${res.status}) ${text}`);
    }
    const page = (await res.json()) as Page<Preclinic>;
    return page.items ?? [];
}

export async function getPreclinic(id: string): Promise<Preclinic> {
    const res = await fetch(`/api/proxy/preclinics/${encodeURIComponent(id)}`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Preclinic ${id} fetch failed (${res.status}) ${text}`);
    }
    return res.json();
}

export async function createPreclinic(input: Partial<Preclinic>) {
    const res = await fetch(`/api/proxy/preclinics`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Create preclinic failed (${res.status}) ${text}`);
    }
    return res.json() as Promise<Preclinic>;
}

export async function updatePreclinic(id: string, input: Partial<Preclinic>) {
    const res = await fetch(`/api/proxy/preclinics/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Update preclinic failed (${res.status}) ${text}`);
    }
    return res.json() as Promise<Preclinic>;
}