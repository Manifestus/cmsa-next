import PatientViewClient from "./patient-view-client";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params; // Next 15: unwrap params
    return <PatientViewClient id={id} />;
}