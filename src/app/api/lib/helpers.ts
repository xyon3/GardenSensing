import { SenseInformation } from "../schemas/sense";

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
