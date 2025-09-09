export interface SenseStore {
    dtm: number; // unix timestamp
    did: string; // device id
    rhu: number; // relative humidity
    tmp: number; // temperature in celcius
}

export interface SenseInformation {
    dateTime: string;
    unit: string;
    relativeHumidity: number;
    temperature: number;
    dewPoint: number;
    heatIndex: number;
    absoluteHumidity: number;
}
