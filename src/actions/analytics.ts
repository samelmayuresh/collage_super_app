'use server';

import { appDb } from '../../lib/db';
import { getSession } from './auth';

// ============ ATTENDANCE ANALYTICS ============

export async function getAttendanceAnalytics(filters?: {
    classId?: number;
    subjectId?: number;
    startDate?: string;
    endDate?: string;
}) {
    const session = await getSession();
    if (!session || (session.role !== 'TEACHING' && session.role !== 'ADMIN')) {
        return { error: 'Unauthorized' };
    }

    try {
        // Get total sessions
        let sessionsQuery = `
            SELECT COUNT(*) as total_sessions,
                   COUNT(CASE WHEN ended_at IS NOT NULL THEN 1 END) as completed_sessions
            FROM attendance_sessions
            WHERE 1=1
        `;
        const sessionsParams: any[] = [];
        let paramCount = 1;

        if (session.role === 'TEACHING') {
            sessionsQuery += ` AND teacher_id = $${paramCount++}`;
            sessionsParams.push(session.id);
        }

        if (filters?.classId) {
            sessionsQuery += ` AND class_id = $${paramCount++}`;
            sessionsParams.push(filters.classId);
        }

        if (filters?.startDate && filters?.endDate) {
            sessionsQuery += ` AND created_at BETWEEN $${paramCount++} AND $${paramCount++}`;
            sessionsParams.push(filters.startDate, filters.endDate);
        }

        const sessionsResult = await appDb.query(sessionsQuery, sessionsParams);

        // Get attendance records count
        let recordsQuery = `
            SELECT COUNT(*) as total_records
            FROM attendance_records ar
            JOIN attendance_sessions s ON ar.session_id = s.id
            WHERE 1=1
        `;
        const recordsParams: any[] = [];
        paramCount = 1;

        if (session.role === 'TEACHING') {
            recordsQuery += ` AND s.teacher_id = $${paramCount++}`;
            recordsParams.push(session.id);
        }

        const recordsResult = await appDb.query(recordsQuery, recordsParams);

        // Get daily attendance for chart (last 30 days)
        const dailyQuery = `
            SELECT DATE(ar.marked_at) as date, COUNT(*) as count
            FROM attendance_records ar
            JOIN attendance_sessions s ON ar.session_id = s.id
            WHERE ar.marked_at >= NOW() - INTERVAL '30 days'
            ${session.role === 'TEACHING' ? 'AND s.teacher_id = $1' : ''}
            GROUP BY DATE(ar.marked_at)
            ORDER BY date
        `;
        const dailyParams = session.role === 'TEACHING' ? [session.id] : [];
        const dailyResult = await appDb.query(dailyQuery, dailyParams);

        // Get class-wise attendance
        const classWiseQuery = `
            SELECT c.name as class_name, COUNT(ar.id) as attendance_count
            FROM attendance_records ar
            JOIN attendance_sessions s ON ar.session_id = s.id
            JOIN classes c ON s.class_id = c.id
            WHERE s.class_id IS NOT NULL
            ${session.role === 'TEACHING' ? 'AND s.teacher_id = $1' : ''}
            GROUP BY c.id, c.name
            ORDER BY attendance_count DESC
            LIMIT 10
        `;
        const classWiseParams = session.role === 'TEACHING' ? [session.id] : [];
        const classWiseResult = await appDb.query(classWiseQuery, classWiseParams);

        return {
            totalSessions: parseInt(sessionsResult.rows[0]?.total_sessions || '0'),
            completedSessions: parseInt(sessionsResult.rows[0]?.completed_sessions || '0'),
            totalRecords: parseInt(recordsResult.rows[0]?.total_records || '0'),
            dailyData: dailyResult.rows,
            classWiseData: classWiseResult.rows
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return { error: 'Failed to fetch analytics' };
    }
}

export async function getStudentAttendanceStats(classId?: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const query = `
            SELECT 
                sc.student_id,
                sc.roll_number,
                c.name as class_name,
                COUNT(ar.id) as present_count,
                (SELECT COUNT(*) FROM attendance_sessions WHERE class_id = sc.class_id AND ended_at IS NOT NULL) as total_sessions
            FROM student_classes sc
            JOIN classes c ON sc.class_id = c.id
            LEFT JOIN attendance_records ar ON ar.student_id = sc.student_id
            ${classId ? 'WHERE sc.class_id = $1' : ''}
            GROUP BY sc.student_id, sc.roll_number, sc.class_id, c.name
            ORDER BY c.name, sc.roll_number
        `;
        const params = classId ? [classId] : [];
        const result = await appDb.query(query, params);

        return { students: result.rows };
    } catch (error) {
        console.error('Error fetching student stats:', error);
        return { error: 'Failed to fetch student stats' };
    }
}
