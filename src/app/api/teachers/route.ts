import { NextResponse } from 'next/server';
import { authDb } from '../../../../lib/db';

export async function GET() {
    try {
        const result = await authDb.query(
            "SELECT id, name, email FROM users WHERE role = 'TEACHING' ORDER BY name"
        );
        return NextResponse.json({ teachers: result.rows });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
    }
}
