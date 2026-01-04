'use server';

import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

// =================== EVENTS ===================

export async function getEvents(filters?: { upcoming?: boolean; type?: string }) {
    try {
        let query = 'SELECT * FROM events';
        const conditions = [];

        if (filters?.upcoming) {
            conditions.push('start_date >= NOW()');
        }
        if (filters?.type) {
            conditions.push(`event_type = '${filters.type}'`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY start_date ASC LIMIT 50';

        const result = await pool.query(query);
        return { success: true, events: result.rows };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createEvent(data: {
    title: string;
    description?: string;
    event_type?: string;
    start_date: string;
    end_date?: string;
    location?: string;
    is_mandatory?: boolean;
    target_roles?: string[];
    created_by: number;
    images?: string[];
    links?: { title: string; url: string }[];
}) {
    try {
        const result = await pool.query(
            `INSERT INTO events (title, description, event_type, start_date, end_date, location, is_mandatory, target_roles, created_by, images, links)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                data.title,
                data.description,
                data.event_type || 'general',
                data.start_date,
                data.end_date,
                data.location,
                data.is_mandatory,
                data.target_roles,
                data.created_by,
                data.images || [],
                JSON.stringify(data.links || [])
            ]
        );
        return { success: true, event: result.rows[0] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function registerForEvent(eventId: number, userId: number) {
    try {
        await pool.query(
            'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [eventId, userId]
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =================== ANNOUNCEMENTS ===================

export async function getAnnouncements(role?: string) {
    try {
        let query = `
            SELECT * FROM announcements 
            WHERE (expires_at IS NULL OR expires_at > NOW())
        `;
        if (role) {
            query += ` AND (target_roles IS NULL OR '${role}' = ANY(target_roles))`;
        }
        query += ' ORDER BY is_pinned DESC, priority DESC, created_at DESC LIMIT 20';

        const result = await pool.query(query);
        return { success: true, announcements: result.rows };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createAnnouncement(data: {
    title: string;
    content: string;
    priority?: string;
    target_roles?: string[];
    is_pinned?: boolean;
    expires_at?: string;
    created_by: number;
}) {
    try {
        const result = await pool.query(
            `INSERT INTO announcements (title, content, priority, target_roles, is_pinned, expires_at, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [data.title, data.content, data.priority || 'normal', data.target_roles, data.is_pinned, data.expires_at, data.created_by]
        );
        return { success: true, announcement: result.rows[0] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =================== ALERTS ===================

export async function getAlerts(userId: number, unreadOnly: boolean = false) {
    try {
        let query = 'SELECT * FROM alerts WHERE user_id = $1';
        if (unreadOnly) {
            query += ' AND is_read = false';
        }
        query += ' ORDER BY created_at DESC LIMIT 50';

        const result = await pool.query(query, [userId]);
        return { success: true, alerts: result.rows };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createAlert(data: {
    user_id: number;
    alert_type: string;
    title: string;
    message: string;
    severity?: string;
    action_url?: string;
}) {
    try {
        const result = await pool.query(
            `INSERT INTO alerts (user_id, alert_type, title, message, severity, action_url)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [data.user_id, data.alert_type, data.title, data.message, data.severity || 'warning', data.action_url]
        );
        return { success: true, alert: result.rows[0] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAlertRead(alertId: number, userId: number) {
    try {
        await pool.query('UPDATE alerts SET is_read = true WHERE id = $1 AND user_id = $2', [alertId, userId]);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAllAlertsRead(userId: number) {
    try {
        await pool.query('UPDATE alerts SET is_read = true WHERE user_id = $1', [userId]);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =================== LOW ATTENDANCE ALERTS ===================

export async function checkAndCreateAttendanceAlerts() {
    try {
        // Get students with attendance below 75%
        const result = await pool.query(`
            SELECT student_id, percentage 
            FROM attendance_summary 
            WHERE month = EXTRACT(MONTH FROM NOW())
            AND year = EXTRACT(YEAR FROM NOW())
            AND percentage < 75
        `);

        for (const row of result.rows) {
            // Check if alert already exists this month
            const existing = await pool.query(`
                SELECT id FROM alerts 
                WHERE user_id = $1 AND alert_type = 'low_attendance'
                AND created_at > NOW() - INTERVAL '7 days'
            `, [row.student_id]);

            if (existing.rows.length === 0) {
                await createAlert({
                    user_id: row.student_id,
                    alert_type: 'low_attendance',
                    title: '⚠️ Low Attendance Warning',
                    message: `Your attendance is at ${row.percentage}%. Minimum required is 75%. Please attend classes regularly to avoid academic consequences.`,
                    severity: row.percentage < 60 ? 'danger' : 'warning',
                    action_url: '/dashboard/student/attendance'
                });
            }
        }

        return { success: true, checked: result.rows.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =================== ATTENDANCE SUMMARY ===================

export async function updateAttendanceSummary(studentId: number) {
    try {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        // Calculate from attendance records
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present
            FROM attendance a
            JOIN attendance_sessions s ON a.session_id = s.id
            WHERE a.student_id = $1
            AND EXTRACT(MONTH FROM a.marked_at) = $2
            AND EXTRACT(YEAR FROM a.marked_at) = $3
        `, [studentId, month, year]);

        const total = parseInt(stats.rows[0].total) || 0;
        const present = parseInt(stats.rows[0].present) || 0;
        const percentage = total > 0 ? (present / total) * 100 : 0;

        await pool.query(`
            INSERT INTO attendance_summary (student_id, month, year, total_classes, present_count, absent_count, percentage, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (student_id, month, year) DO UPDATE SET
                total_classes = $4,
                present_count = $5,
                absent_count = $6,
                percentage = $7,
                updated_at = NOW()
        `, [studentId, month, year, total, present, total - present, percentage.toFixed(2)]);

        // Check and create alert if needed
        if (percentage < 75) {
            await createAlert({
                user_id: studentId,
                alert_type: 'low_attendance',
                title: '⚠️ Attendance Alert',
                message: `Your attendance dropped to ${percentage.toFixed(1)}%. Maintain at least 75% to avoid issues.`,
                severity: percentage < 60 ? 'danger' : 'warning'
            });
        }

        return { success: true, percentage };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
