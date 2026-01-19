export default function ForbiddenPage() {
    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold mb-2">Forbidden</h1>
            <p className="text-sm text-muted-foreground">
                Your account is authenticated but lacks the required role(s). If this is unexpected,
                contact an administrator.
            </p>
        </main>
    );
}