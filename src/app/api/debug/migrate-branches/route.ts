import { NextResponse } from 'next/server';
import { appDb } from '../../../../../lib/db';

export async function GET() {
    try {
        // Create branches table
        await appDb.query(`
            CREATE TABLE IF NOT EXISTS branches (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Create teacher_branches table
        await appDb.query(`
            CREATE TABLE IF NOT EXISTS teacher_branches (
                id SERIAL PRIMARY KEY,
                teacher_id INT NOT NULL,
                branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
                assigned_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(teacher_id)
            );
        `);

        // Create indexes
        await appDb.query(`CREATE INDEX IF NOT EXISTS idx_teacher_branches_teacher ON teacher_branches(teacher_id);`);
        await appDb.query(`CREATE INDEX IF NOT EXISTS idx_teacher_branches_branch ON teacher_branches(branch_id);`);

        return NextResponse.json({
            success: true,
            message: 'Migration complete: branches and teacher_branches tables created'
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}
