"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
    const { data: session, status } = useSession();
    const loading = status === "loading";

    if (loading) return <button disabled>Loading…</button>;
    if (!session) {
        return <button onClick={() => signIn("auth0")}>Log in</button>;
    }
    return (
        <>
            <span>Hi {(session.user?.name ?? session.user?.email) || "User"}</span>
            <button onClick={() => signOut()}>Log out</button>
        </>
    );
}