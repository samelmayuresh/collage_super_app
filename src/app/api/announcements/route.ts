import { NextResponse } from 'next/server';
import { getAnnouncements, createAnnouncement } from '../../../actions/events';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;

    const result = await getAnnouncements(role);
    if (result.success) {
        return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 500 });
}

export async function POST(request: Request) {
    const body = await request.json();
    const result = await createAnnouncement(body);
    if (result.success) {
        return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 500 });
}
