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

export interface ProxmoxSampleData {
    nodeName: string;
    cpuLoadPercent: number;
    memoryPercent: number;
    vmCount: number;
    containerCount: number;
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

export const PROXMOX_SAMPLE_DATA: SampleModuleResponse<ProxmoxSampleData> = {
    status: 'online',
    mode: 'sample',
    data: {
        nodeName: 'pve-cluster-primary',
        cpuLoadPercent: 14.2,
        memoryPercent: 42.8,
        vmCount: 14,
        containerCount: 8,
    },
};
