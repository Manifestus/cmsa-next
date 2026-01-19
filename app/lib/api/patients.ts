// app/lib/api/patients.ts
export type Patient = {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    dob?: string | null;
    sex?: "M" | "F" | "Other" | "Unknown" | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
    createdAt?: string;
};

type PatientPage = { items: Patient[]; nextCursor: string | null };

export async function fetchPatients(limit = 50): Promise<Patient[]> {
    // NOTE: your proxy auto-prefixes /api, so we DO NOT include it here.
    const res = await fetch(`/api/proxy/patients?limit=${encodeURIComponent(String(limit))}`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Patients fetch failed (${res.status}) ${text}`);
    }
    const page = (await res.json()) as PatientPage;
    return page.items ?? [];
}

export async function getPatient(id: string): Promise<Patient> {
    const res = await fetch(`/api/proxy/patients/${encodeURIComponent(id)}`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Patient ${id} fetch failed (${res.status}) ${text}`);
    }
    return res.json();
}

export async function createPatient(input: {
    mrn: string;
    firstName: string;
    lastName: string;
    dob?: string | null;
    sex?: "M" | "F" | "Other" | "Unknown" | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
}) {
    const res = await fetch(`/api/proxy/patients`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Create failed (${res.status}) ${text}`);
    }
    return res.json() as Promise<Patient>;
}

export async function updatePatient(id: string, patch: Partial<{
    mrn: string;
    firstName: string;
    lastName: string;
    dob?: string | null;
    sex?: "M" | "F" | "Other" | "Unknown" | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
}>) {
    const res = await fetch(`/api/proxy/patients/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Update failed (${res.status}) ${text}`);
    }
    return res.json() as Promise<Patient>;
}