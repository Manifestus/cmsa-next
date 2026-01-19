export type InvoiceStatus = "draft" | "posted" | "void";

export type InvoiceLine = {
    id: string;
    lineNo: number;
    description: string;
    itemType: "service" | "product";
    qty: string;        // numeric in DB, keep as string from API
    unitPrice: string;  // "
    discountPct: string;
    taxRatePct: string;
    lineTotal: string;
    serviceId?: string | null;
    productId?: string | null;
    providerId?: string | null;
};

export type Invoice = {
    id: string;
    invoiceNo: string;
    status: InvoiceStatus;
    invoiceAt: string;     // ISO
    patientId?: string | null;
    locationId: string;
    cashierId: string;
    registerId?: string | null;
    subtotal: string;
    discountTotal: string;
    taxTotal: string;
    total: string;

    // Optional expansions (depends on your API response)
    patient?: { id: string; firstName?: string | null; lastName?: string | null } | null;
    lines?: InvoiceLine[];
};

type Page<T> = { items: T[]; nextCursor: string | null };

/**
 * Fetch invoices with optional filters.
 * - limit: page size (default 50)
 * - status: "draft" | "posted" | "void"
 * - from / to: YYYY-MM-DD (date range)
 * - patientId: limit to a patient (optional, useful from POS)
 */
export async function fetchInvoices(params?: {
    limit?: number;
    status?: InvoiceStatus;
    from?: string;
    to?: string;
    patientId?: string;
}): Promise<Invoice[]> {
    const q = new URLSearchParams();
    q.set("limit", String(params?.limit ?? 50));
    if (params?.status) q.set("status", params.status);
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    if (params?.patientId) q.set("patientId", params.patientId);

    const url = `/api/proxy/invoices${q.toString() ? `?${q.toString()}` : ""}`;

    const res = await fetch(url, { credentials: "include", cache: "no-store" });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`No se pudo cargar facturas (${res.status}) ${txt}`);
    }
    const data = (await res.json()) as Page<Invoice> | Invoice[];
    return Array.isArray(data) ? data : data.items ?? [];
}

export async function getInvoice(id: string): Promise<Invoice> {
    const res = await fetch(`/api/proxy/invoices/${encodeURIComponent(id)}`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`No se pudo cargar la factura (${res.status}) ${txt}`);
    }
    return res.json();
}

/**
 * Create payment for an invoice.
 */
export async function createInvoicePayment(
    invoiceId: string,
    payload: {
        method: "cash" | "card" | "transfer" | "other";
        amount: number;
        currency?: string; // default HNL
        reference?: string;
        posTerminalId?: string;
    }
) {
    const res = await fetch(
        `/api/proxy/invoices/${encodeURIComponent(invoiceId)}/payments`,
        {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
        }
    );
    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`No se pudo registrar el pago (${res.status}). ${t}`);
    }
    return res.json();
}

/**
 * Helper for printable PDF.
 * If your backend exposes GET /api/invoices/:id/pdf through the proxy,
 * this returns the ready-to-open URL.
 */
export function getInvoicePdfUrl(invoiceId: string): string {
    return `/api/proxy/invoices/${encodeURIComponent(invoiceId)}/pdf`;
}