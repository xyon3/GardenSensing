import firestore from "@/app/api/lib/firestore";
import validateBody from "@/app/api/lib/validateBody";
import { ThresholdStore } from "@/app/api/schemas/threshold";
import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

/*
 * Action: Get threshold configurations
 */
export async function GET() {
    const snapshot = await firestore().collection("threshold").get();

    const thresholdConfigurations = snapshot.docs.map((doc) => ({
        id: doc.id, // add Firestore doc ID
        ...doc.data(),
    }));

    return NextResponse.json(
        { message: "SUCCESS", results: thresholdConfigurations },
        { status: 200 }
    );
}

/*
 * Action: Create new threshold configuration
 */
export async function POST(request: NextRequest) {
    const requestBody = await request.json();
    const requiredData = ["pln", "thr"];

    const validated = validateBody(requiredData, requestBody);

    if (validated.message !== "PROCEED") {
        return NextResponse.json(validated, { status: 400 });
    }

    const newThreshold: ThresholdStore = {
        tid: randomUUID().toString().split("-")[0],
        pln: requestBody.pln,
        thr: requestBody.thr,
    };

    try {
        const thresholdCollection = firestore().collection("threshold");

        // Device does not exist → create new
        await thresholdCollection.add(newThreshold);

        return NextResponse.json({ message: "CREATED" }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "COULD_NOT_ADD_OR_UPDATE" },
            { status: 500 }
        );
    }
}

/*
 * Action: Delete threshold configuration
 */
export async function DELETE(request: NextRequest) {
    const requestBody = await request.json();

    const requiredData = ["id"];

    const validated = validateBody(requiredData, requestBody);

    if (validated.message !== "PROCEED") {
        return NextResponse.json(validated, { status: 400 });
    }

    const thresholdRef = firestore()
        .collection("threshold")
        .doc(requestBody.id);

    const res = await thresholdRef.delete();

    return NextResponse.json(
        { message: "SUCCESS", results: [res] },
        { status: 200 }
    );
}
