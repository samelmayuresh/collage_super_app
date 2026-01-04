import { NextResponse } from 'next/server';
import { getEvents, createEvent } from '../../../actions/events';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const type = searchParams.get('type') || undefined;

    const result = await getEvents({ upcoming, type });
    if (result.success) {
        return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 500 });
}

export async function POST(request: Request) {
    const body = await request.json();
    const result = await createEvent(body);
    if (result.success) {
        return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 500 });
}
