import NextAuth, { type NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

const issuer =
    process.env.AUTH0_ISSUER_BASE_URL ??
    (process.env.AUTH0_DOMAIN ? `https://${process.env.AUTH0_DOMAIN}` : undefined);

if (!issuer || !issuer.startsWith("http")) {
    // This is what caused “only valid absolute URLs can be requested”
    throw new Error(
        "Invalid/missing Auth0 issuer. Set AUTH0_ISSUER_BASE_URL (e.g. https://YOUR_DOMAIN) or AUTH0_DOMAIN."
    );
}

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    providers: [
        Auth0Provider({
            issuer, // absolute URL, no trailing slash needed
            clientId: process.env.AUTH0_CLIENT_ID!,
            clientSecret: process.env.AUTH0_CLIENT_SECRET!,
            authorization: {
                params: {
                    audience: process.env.AUTH0_AUDIENCE,
                    scope: process.env.AUTH0_SCOPE ?? "openid profile email offline_access",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.expiresAt = account.expires_at ? account.expires_at * 1000 : undefined;
                token.scope = account.scope;
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            (session as any).accessTokenExpiresAt = token.expiresAt;
            (session as any).scope = token.scope;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };