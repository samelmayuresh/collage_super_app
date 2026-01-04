import { NextResponse } from 'next/server';
import { getSession } from '../../../../../actions/auth';
import { markAlertRead } from '../../../../../actions/events';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || !session.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const alertId = parseInt(params.id);
    if (isNaN(alertId)) {
        return NextResponse.json({ success: false, error: 'Invalid alert ID' }, { status: 400 });
    }

    const result = await markAlertRead(alertId, parseInt(session.userId));

    if (result.success) {
        return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 500 });
}
