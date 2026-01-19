import PreclinicEditClient from "./preclinic-edit-client";

export default function Page({ params }: { params: { id: string } }) {
    return <PreclinicEditClient id={params.id} />;
}