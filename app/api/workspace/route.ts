import { getValidToken } from '@/lib/google';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const token = await getValidToken();
        
        // 1. Fetch Gmail Unread Count
        const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let unread = 0;
        if (gmailRes.ok) {
            const gmailData = await gmailRes.json();
            unread = gmailData.messagesUnread || 0;
        } else {
            const errText = await gmailRes.text().catch(() => 'Unknown error');
            console.error('Gmail API Error:', gmailRes.status, errText);
        }

        // 2. Fetch Calendar Events
        const now = new Date().toISOString();
        const encodedNow = encodeURIComponent(now);
        const calendarRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodedNow}&maxResults=5&singleEvents=true&orderBy=startTime`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let events = [];
        if (calendarRes.ok) {
            const calendarData = await calendarRes.json();
            events = (calendarData.items || []).map((event: any) => {
                return {
                    title: event.summary || 'Untitled Event',
                    start: event.start?.dateTime || event.start?.date,
                    isAllDay: !event.start?.dateTime && !!event.start?.date
                };
            });
        } else {
            const errText = await calendarRes.text().catch(() => 'Unknown error');
            console.error('Calendar API Error:', calendarRes.status, errText);
        }

        // 3. Fetch Tasks
        let tasks = 0;
        try {
            const tasksRes = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?status=needsAction', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                tasks = (tasksData.items || []).length;
            } else {
                const errText = await tasksRes.text().catch(() => 'Unknown error');
                console.error('Tasks API Error:', tasksRes.status, errText);
            }
        } catch (e) {
            console.error('Tasks Fetch Error:', e);
        }

        return NextResponse.json({
            unread,
            events,
            tasks
        });
    } catch (err: any) {
        console.error('Workspace API Error:', err);
        return NextResponse.json({ error: 'Internal server error while fetching Workspace data' }, { status: 500 });
    }
}
