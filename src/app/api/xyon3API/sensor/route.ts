import { NextResponse, type NextRequest } from "next/server";

/*
 * Action:
 */
export async function GET(request: NextRequest) {
    return NextResponse.json({}, { status: 200 });
}

/*
 * Action:
 */
export async function POST(request: NextRequest) {
    return NextResponse.json({}, { status: 201 });
}
