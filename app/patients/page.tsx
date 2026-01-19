import PatientDashboard from "@/app/patients/_components/PatientDashboard";

export default function PatientsPage() {
    return (
        <div className="h-full flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Patients</h1>
                <p className="text-sm text-muted-foreground">Search and manage patient records.</p>
            </div>
            <PatientDashboard />
        </div>
    );
}