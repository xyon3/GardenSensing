import { NextResponse, type NextRequest } from "next/server";
import firestore from "../../lib/firestore";
import { SenseStore } from "../../schemas/sense";
import dayjs from "dayjs";
import {
    getAveragePerDay,
    getAveragePerMonth,
    getAveragePerWeek,
} from "../../lib/helpers";

import sampleData from "@/sensor_data_feb_to_sep_2025.json";

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const deviceIDParam = params.get("deviceID");

    const unixNow: number = Math.floor(Date.now());

    const currentDate = dayjs(unixNow);

    const lastMonth = currentDate.subtract(1, "month").endOf("month");

    const lastSixMonths = lastMonth.subtract(6, "month").startOf("month");

    let lastSixMonthsResults: SenseStore[] = sampleData;

    if (
        request.headers.get("x-environment") ??
        "" == process.env.ENVIRONMENT_KEY_PROD
    ) {
        let lastSixMonthsQuery: FirebaseFirestore.Query =
            firestore().collection("sense");

        console.log({
            cd: currentDate.unix(),
            lsm: lastSixMonths.unix(),
        });

        lastSixMonthsQuery = lastSixMonthsQuery.where(
            "dtm",
            ">=",
            lastSixMonths.unix()
        );
        lastSixMonthsQuery = lastSixMonthsQuery.where(
            "dtm",
            "<=",
            currentDate.unix()
        );

        if (deviceIDParam) {
            lastSixMonthsQuery = lastSixMonthsQuery.where(
                "did",
                "==",
                deviceIDParam
            );
        }

        lastSixMonthsQuery = lastSixMonthsQuery.orderBy("dtm", "desc");

        const snapshot = await lastSixMonthsQuery.get();

        lastSixMonthsResults = snapshot.docs.map(
            (doc) =>
                ({
                    ...doc.data(),
                }) as SenseStore
        );
    }

    const monthly = getAveragePerMonth(lastSixMonthsResults, lastSixMonths);
    const weekly = getAveragePerWeek(
        lastSixMonthsResults,
        currentDate.subtract(1, "week")
    );

    const daily = getAveragePerDay(lastSixMonthsResults, currentDate);

    return NextResponse.json({
        message: "SUCCESS",
        results: {
            daily,
            weekly,
            monthly,
        },
    });
}
