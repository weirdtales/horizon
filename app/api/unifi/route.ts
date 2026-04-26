import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';
import { UNIFI_SAMPLE_DATA } from '@/lib/sample-data';

export async function GET() {
    const settings = getSettings();
    const unifi = settings.unifi;
    const connectorConfigured = Boolean(unifi?.host && unifi?.user && unifi?.password);

    return NextResponse.json({
        ...UNIFI_SAMPLE_DATA,
        connectorConfigured,
    });
}

