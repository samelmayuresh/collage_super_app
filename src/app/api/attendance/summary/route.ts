import { NextResponse } from 'next/server';
import { updateAttendanceSummary } from '../../../../actions/events';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ success: false, error: 'UserId required' }, { status: 400 });
    }

    const result = await updateAttendanceSummary(parseInt(userId));
    if (result.success) {
        return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 500 });
}
