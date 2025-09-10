import { Dayjs } from "dayjs";
import { SenseInformation, SenseStore } from "../schemas/sense";

export function convertTimeUnixISO(timestamp: number, offset: number = 8) {
    return new Date(timestamp * 1000 + 3600 * 1000 * offset)
        .toISOString()
        .split(".")[0]
        .replace("T", " ");
}

export function convertTimeISOUnix(
    timestring: string
    // offset: number = 8
) {
    return new Date(timestring).getTime() / 1000;
    // return new Date(timestring).getTime() / 1000 + 3600 * offset;
}

export function getAveragePerDay(
    senseData: SenseStore[] | null,
    currentDate: Dayjs
) {
    const numberOfDays = Array.from({ length: 7 }, (_, i) => i);

    let startDay: Dayjs;
    let endDay: Dayjs;

    return numberOfDays.map((_) => {
        startDay = currentDate.startOf("day");
        endDay = currentDate.endOf("day");

        let dayData =
            senseData &&
            senseData.filter(
                (data) =>
                    data.dtm >= startDay.unix() && data.dtm <= endDay.unix()
            );

        let toBeStored = {
            date: startDay.format("YYYY-MM-DD"),
            average: {
                temperature:
                    (dayData?.reduce((total, data) => total + data.tmp, 0) ??
                        0) / (dayData?.length ?? 0),
                relativeHumidity: Math.floor(
                    (dayData?.reduce((total, data) => total + data.rhu, 0) ??
                        0) / (dayData?.length ?? 0)
                ),
            },
        };

        currentDate = currentDate.subtract(1, "day");

        return toBeStored;
    });
}

export function getAveragePerWeek(
    senseData: SenseStore[] | null,
    currentDate: Dayjs
) {
    const numberOfWeeks = Array.from({ length: 7 }, (_, i) => i);

    let startWeek: Dayjs;
    let endWeek: Dayjs;

    return numberOfWeeks.map((_) => {
        startWeek = currentDate.startOf("week");
        endWeek = currentDate.endOf("week");

        let weekData =
            senseData &&
            senseData.filter(
                (data) =>
                    data.dtm >= startWeek.unix() && data.dtm <= endWeek.unix()
            );

        let toBeStored = {
            startOfWeek: startWeek.format("YYYY-MM-DD"),
            endOfWeek: endWeek.format("YYYY-MM-DD"),
            average: {
                temperature:
                    (weekData?.reduce((total, data) => total + data.tmp, 0) ??
                        0) / (weekData?.length ?? 0),
                relativeHumidity: Math.floor(
                    (weekData?.reduce((total, data) => total + data.rhu, 0) ??
                        0) / (weekData?.length ?? 0)
                ),
            },
        };

        currentDate = currentDate.subtract(1, "week");

        return toBeStored;
    });
}

export function getAveragePerMonth(
    senseData: SenseStore[] | null,
    sixMonthsAgo: Dayjs
) {
    const numberOfMonths = Array.from({ length: 6 }, (_, i) => i);

    let currentMonth = sixMonthsAgo;
    let startMonth: Dayjs;
    let endMonth: Dayjs;

    return numberOfMonths.map((_) => {
        startMonth = currentMonth.startOf("month");
        endMonth = currentMonth.endOf("month");

        let monthData =
            senseData &&
            senseData.filter(
                (data) =>
                    data.dtm >= startMonth.unix() && data.dtm <= endMonth.unix()
            );

        let toBeStored = {
            month: endMonth.month() + 1,
            endOfMonth: endMonth.format("YYYY-MM-DD"),
            average: {
                temperature:
                    (monthData?.reduce((total, data) => total + data.tmp, 0) ??
                        0) / (monthData?.length ?? 0),
                relativeHumidity: Math.floor(
                    (monthData?.reduce((total, data) => total + data.rhu, 0) ??
                        0) / (monthData?.length ?? 0)
                ),
            },
        };

        currentMonth = currentMonth.add(1, "month");

        return toBeStored;
    });
}

/**
 * Compute derived values from temperature and relative humidity
 */
export function computeSenseInformation(
    timestamp: number,
    temperature: number,
    relativeHumidity: number
): SenseInformation {
    const now = convertTimeUnixISO(timestamp);

    const unit = "C";

    // --- Dew Point (Magnus formula) ---
    const a = 17.27;
    const b = 237.7;
    const gamma =
        (a * temperature) / (b + temperature) +
        Math.log(relativeHumidity / 100);
    const dewPoint = (b * gamma) / (a - gamma);

    // --- Heat Index (NWS formula in °C) ---
    // Only valid for T >= 26 °C and RH >= 40%
    let heatIndex = temperature;
    if (temperature >= 26 && relativeHumidity >= 40) {
        const T = temperature;
        const R = relativeHumidity;
        heatIndex =
            -8.784695 +
            1.61139411 * T +
            2.338549 * R -
            0.14611605 * T * R -
            0.012308094 * T * T -
            0.016424828 * R * R +
            0.002211732 * T * T * R +
            0.00072546 * T * R * R -
            0.000003582 * T * T * R * R;
    }

    // --- Absolute Humidity (g/m³) ---
    const tempK = temperature + 273.15; // convert to Kelvin
    const exp = Math.exp((17.67 * temperature) / (temperature + 243.5));
    const AH = (6.112 * exp * relativeHumidity * 2.1674) / (100 * tempK);

    return {
        dateTime: now,
        unit,
        relativeHumidity,
        temperature,
        dewPoint: parseFloat(dewPoint.toFixed(1)),
        heatIndex: parseFloat(heatIndex.toFixed(1)),
        absoluteHumidity: parseFloat(AH.toFixed(1)),
    };
}
