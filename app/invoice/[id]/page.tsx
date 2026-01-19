import InvoiceViewClient from "./invoice-view-client";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { id: string } }) {
    return <InvoiceViewClient id={params.id} />;
}