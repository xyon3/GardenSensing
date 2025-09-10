export interface DeviceStore {
    did: string; // device unique id
    ip4: string; // ip address
    dnm: string; // device nickname
    sts: number; // device status: 0 - inactive (default) | 1 - active
}

export interface DeviceInformation {
    ipv4: string;
    deviceNicname: string;
}
