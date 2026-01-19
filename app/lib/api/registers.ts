export type CashRegister = {
    id: string;
    name: string;
    locationId?: string | null;
    location?: { id: string; name: string } | null;
};

export async function fetchRegisters(limit = 200): Promise<CashRegister[]> {
    const res = await fetch(`/api/proxy/registers?limit=${encodeURIComponent(String(limit))}`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`No se pudieron cargar las cajas (${res.status}) ${txt}`);
    }
    const data = (await res.json()) as CashRegister[];
    return data;
}