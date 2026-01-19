// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!; // e.g. http://localhost:8000
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;
const API_PREFIX = process.env.API_PREFIX ?? "api";     // default "api"

async function getBearerFromNextAuth(req: NextRequest) {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    return (token as any)?.accessToken ?? null;
}

async function forward(
    req: NextRequest,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string[],
) {
    const token = await getBearerFromNextAuth(req);
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const target = `${API_BASE}/${API_PREFIX}/${path.join("/")}${req.nextUrl.search}`;

    const upstream = await fetch(target, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(method !== "GET" && method !== "DELETE"
                ? { "content-type": req.headers.get("content-type") ?? "application/json" }
                : {}),
        },
        body: method === "GET" || method === "DELETE" ? undefined : await req.text(),
    });

    const body = await upstream.text();
    return new NextResponse(body, {
        status: upstream.status,
        headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
}

// params is a Promise in recent Next.js route handlers
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return forward(req, "GET", path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return forward(req, "POST", path);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return forward(req, "PUT", path);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return forward(req, "PATCH", path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return forward(req, "DELETE", path);
}