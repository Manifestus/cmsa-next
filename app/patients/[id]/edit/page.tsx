import PatientEditClient from "./patient-edit-client";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <PatientEditClient id={id} />;
}