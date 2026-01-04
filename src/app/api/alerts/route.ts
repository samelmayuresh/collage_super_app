import { NextResponse } from 'next/server';
import { getAlerts, createAlert } from '../../../actions/events';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
        return NextResponse.json({ success: false, error: 'UserId required' }, { status: 400 });
    }

    const result = await getAlerts(parseInt(userId), unreadOnly);
    if (result.success) {
        return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 500 });
}

export async function POST(request: Request) {
    const body = await request.json();
    const result = await createAlert(body);
    if (result.success) {
        return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 500 });
}
