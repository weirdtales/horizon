import { NextResponse } from 'next/server';
import { getNpmStats } from '@/lib/npm';

export async function GET() {
    try {
        const stats = await getNpmStats();
        return NextResponse.json({ success: true, stats });
    } catch (err: unknown) {
        console.error('NPM Stats API Error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch NPM stats' }, { status: 500 });
    }
}
