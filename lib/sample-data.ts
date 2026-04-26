export type ModuleDataMode = 'sample' | 'connected';

export interface SampleModuleResponse<T> {
    status: 'online';
    mode: ModuleDataMode;
    data: T;
}

export interface UniFiSampleData {
    controllerName: string;
    uptimeDays: number;
    clients: number;
    devices: number;
    trafficMbps: number;
    trafficPercent: number;
}

export const UNIFI_SAMPLE_DATA: SampleModuleResponse<UniFiSampleData> = {
    status: 'online',
    mode: 'sample',
    data: {
        controllerName: 'UniFi Demo Controller',
        uptimeDays: 42,
        clients: 42,
        devices: 4,
        trafficMbps: 842,
        trafficPercent: 65,
    },
};

