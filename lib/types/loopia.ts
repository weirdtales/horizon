export interface LoopiaRecord {
    type: string;
    ttl: number;
    priority: number;
    rdata: string;
    record_id?: number;
}
