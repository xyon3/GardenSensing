import firestore from "@/app/api/lib/firestore";
import { computeSenseInformation } from "@/app/api/lib/helpers";
import { SenseStore } from "@/app/api/schemas/sense";
import { NextResponse, type NextRequest } from "next/server";

/*
 * Action: Get device latest reading
 */
export async function GET(
<<<<<<< Updated upstream
    _: NextRequest,
    { params }: { params: { did: string } }
=======
    request: NextRequest,
    { context }: { context: Promise<{ did: string }> }
>>>>>>> Stashed changes
) {
    const { did } = await context;

    let query: FirebaseFirestore.Query = firestore().collection("sense");

    query = query.where("did", "==", did);
    query = query.orderBy("dtm", "desc");
    query = query.limit(1);

    const snapshot = await query.get();

    const queryResults: SenseStore[] = snapshot.docs.map(
        (doc) =>
            ({
                ...doc.data(),
            }) as SenseStore
    );

    const latestData = queryResults[0];

    if (!latestData) {
        return NextResponse.json({ message: "NO_DATA_FOUND" }, { status: 404 });
    }

    const results = computeSenseInformation(
        latestData.dtm,
        latestData.tmp,
        latestData.rhu
    );

    let deviceQuery: FirebaseFirestore.Query = firestore().collection("device");
    deviceQuery = deviceQuery.where("did", "==", did);
    const deviceSnapshot = await deviceQuery.get();

    const deviceQueryResults = deviceSnapshot.docs.map((doc) => ({
        ...doc.data(),
    }));

    return NextResponse.json(
        { message: "SUCCESS", device: deviceQueryResults[0], results },
        { status: 200 }
    );
}

/*
 * Action:
 */
export async function POST(request: NextRequest) {
    return NextResponse.json({}, { status: 201 });
}
