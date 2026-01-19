export function invoicePdfUrl(id: string) {
    return `/api/proxy/invoices/${encodeURIComponent(id)}/print`;
}