import PreclinicViewClient from "./preclinic-view-client";

export default function Page({ params }: { params: { id: string } }) {
    return <PreclinicViewClient id={params.id} />;
}