import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const frequency = (params.get("freq") ?? "").toLowerCase();

    if (frequency == "weekly") {
    }

    if (frequency == "monthly") {
    }

    return NextResponse.json({});
}
