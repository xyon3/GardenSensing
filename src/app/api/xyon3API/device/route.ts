import { NextResponse, type NextRequest } from "next/server";
import validateBody from "../../lib/validateBody";
import firestore from "../../lib/firestore";
import { DeviceStore } from "../../schemas/device";

/*
 * Action: Get all registered davices
 */
export async function GET() {
    const snapshot = await firestore().collection("device").get();

    const devices = snapshot.docs.map((doc) => ({
        id: doc.id, // add Firestore doc ID
        ...doc.data(),
    }));

    return NextResponse.json(
        { message: "SUCCESS", results: devices },
        { status: 200 }
    );
}

/*
 * Action: Register or update a device (upsert on `did`)
 */
export async function POST(request: NextRequest) {
    const requestBody = await request.json();
    const requiredData = ["did", "dnm", "ip4"];

    const validated = validateBody(requiredData, requestBody);

    if (validated.message !== "PROCEED") {
        return NextResponse.json(validated, { status: 400 });
    }

    const newDevice: DeviceStore = {
        did: requestBody.did,
        dnm: requestBody.dnm,
        ip4: requestBody.ip4,
    };

    try {
        const deviceCollection = firestore().collection("device");

        // Query for existing device with same DID
        const snapshot = await deviceCollection
            .where("did", "==", newDevice.did)
            .get();

        if (!snapshot.empty) {
            // Device exists → update first match
            const docRef = snapshot.docs[0].ref;
            await docRef.set(newDevice, { merge: true });

            return NextResponse.json(
                { message: "DEVICE_UPDATED" },
                { status: 200 }
            );
        } else {
            // Device does not exist → create new
            await deviceCollection.add(newDevice);

            return NextResponse.json(
                { message: "DEVICE_REGISTERED" },
                { status: 201 }
            );
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "COULD_NOT_ADD_OR_UPDATE" },
            { status: 500 }
        );
    }
}
