// app/api/middleware.ts

import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    // const origin = request.headers.get("origin");

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");

    // Handle preflight request (OPTIONS)
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
            headers,
        });
    }

    return NextResponse.next({ headers });
}
