import { NextResponse, type NextRequest } from "next/server";
import validateBody from "../../lib/validateBody";
import firestore from "../../lib/firestore";
import { SenseStore } from "../../schemas/sense";
import { computeSenseInformation, convertTimeISOUnix } from "../../lib/helpers";

/*
 * Action: Get sense data with optional date range query
 * Query parameters:
 *   start: unix timestamp (optional)
 *   end: unix timestamp (optional)
 */
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const deviceIDParam = url.searchParams.get("deviceID");
        const startParam = url.searchParams.get("start");
        const endParam = url.searchParams.get("end");

        if (!(startParam && endParam)) {
            return NextResponse.json(
                {
                    message: "FAILED",
                    results: "Incompete parameters",
                },
                { status: 400 }
            );
        }

        const start = convertTimeISOUnix(startParam);
        const end = convertTimeISOUnix(endParam);

        if (start > end) {
            return NextResponse.json(
                {
                    message: "FAILED",
                    results:
                        "Operation is invalid. Kindly correct your date range.",
                },
                { status: 400 }
            );
        }

        let query: FirebaseFirestore.Query = firestore().collection("sense");
        query = query.where("dtm", ">=", start);
        query = query.where("dtm", "<=", end);

        if (deviceIDParam) {
            query = query.where("did", "==", deviceIDParam);
        }

        // Optional: order by timestamp ascending
        query = query.orderBy("dtm", "desc");

        const snapshot = await query.get();

        const results: SenseStore[] = snapshot.docs.map(
            (doc) =>
                ({
                    ...doc.data(),
                }) as SenseStore
        );

        const senseInfo = results.map((index) => ({
            deviceID: index.did,
            ...computeSenseInformation(index.dtm, index.tmp, index.rhu),
        }));

        return NextResponse.json(
            {
                message: "SUCCESS",
                results: senseInfo,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "COULD_NOT_FETCH" },
            { status: 500 }
        );
    }
}
/*
 * Action: Register one device
 */
export async function POST(request: NextRequest) {
    const requestBody = await request.json();
    const requiredData = ["did", "rhu", "tmp"];

    const validated = validateBody(requiredData, requestBody);

    if (validated.message !== "PROCEED") {
        return NextResponse.json(validated, { status: 400 });
    }

    const newSense: SenseStore = {
        dtm: Math.floor(new Date(Date.now()).getTime() / 1000), // convert unix timestamp
        did: requestBody.did,
        rhu: requestBody.rhu,
        tmp: requestBody.tmp,
    };

    try {
        firestore()
            .collection("sense")
            .add(newSense)
            .then((doc) => {
                console.log("\n");
                console.log(
                    "INSERT_SENSE_DATA_SUCCESS: ",
                    JSON.stringify(doc, null, 4)
                );
                console.log("\n");
            });

        return NextResponse.json({}, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "COULD_NOT_ADD" }, { status: 500 });
    }
}
