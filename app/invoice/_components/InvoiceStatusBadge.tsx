export default function InvoiceStatusBadge({ status }: { status: "draft" | "posted" | "void" }) {
    const cls =
        status === "posted"
            ? "bg-emerald-100 text-emerald-800"
            : status === "void"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-800";

    const label =
        status === "posted" ? "Emitida"
            : status === "void" ? "Anulada"
                : "Borrador";

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
    );
}