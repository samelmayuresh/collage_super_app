'use server';

import { appDb, authDb } from '../../lib/db';
import { getSession } from './auth';
import { haversineDistance, generateQRToken } from '../../lib/geo';

// ============ ATTENDANCE SESSIONS (Teacher) ============

export async function startAttendanceSession(classroomId: number, classId?: number, subjectId?: number) {
    const session = await getSession();
    if (!session || session.role !== 'TEACHING') {
        return { error: 'Unauthorized - Teachers only' };
    }

    try {
        // Check for existing active session in this classroom
        const existing = await appDb.query(
            'SELECT * FROM attendance_sessions WHERE classroom_id = $1 AND is_active = true',
            [classroomId]
        );

        if (existing.rows.length > 0) {
            const activeSession = existing.rows[0];
            const startTime = new Date(activeSession.started_at).getTime();
            const now = Date.now();
            const hoursSinceStart = (now - startTime) / (1000 * 60 * 60);

            // Auto-close if session is stale (older than 4 hours)
            // OR if it's the same teacher trying to start a new one (force restart)
            if (hoursSinceStart > 4 || activeSession.teacher_id === session.id) {
                await appDb.query(
                    'UPDATE attendance_sessions SET is_active = false, ended_at = NOW() WHERE id = $1',
                    [activeSession.id]
                );
            } else {
                return { error: 'An active session already exists for this classroom' };
            }
        }

        const qrToken = generateQRToken();
        const expiresAt = new Date(Date.now() + 20 * 1000); // 20 seconds

        const result = await appDb.query(
            `INSERT INTO attendance_sessions (classroom_id, teacher_id, qr_token, expires_at, class_id, subject_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [classroomId, session.id, qrToken, expiresAt, classId || null, subjectId || null]
        );

        return {
            success: true,
            session: result.rows[0],
            qrToken,
            expiresAt: expiresAt.toISOString()
        };
    } catch (error) {
        console.error('Error starting session:', error);
        return { error: 'Failed to start attendance session' };
    }
}

export async function refreshQRToken(sessionId: number) {
    const session = await getSession();
    if (!session || session.role !== 'TEACHING') {
        return { error: 'Unauthorized - Teachers only' };
    }

    try {
        // Verify teacher owns this session AND it is active
        const check = await appDb.query(
            'SELECT * FROM attendance_sessions WHERE id = $1 AND teacher_id = $2 AND is_active = true',
            [sessionId, session.id]
        );

        if (check.rows.length === 0) {
            return { error: 'Session not found or not active' };
        }

        const qrToken = generateQRToken();
        const expiresAt = new Date(Date.now() + 20 * 1000);

        await appDb.query(
            'UPDATE attendance_sessions SET qr_token = $1, expires_at = $2 WHERE id = $3',
            [qrToken, expiresAt, sessionId]
        );

        return {
            success: true,
            qrToken,
            expiresAt: expiresAt.toISOString()
        };
    } catch (error) {
        console.error('Error refreshing QR:', error);
        return { error: 'Failed to refresh QR code' };
    }
}

export async function endAttendanceSession(sessionId: number) {
    const session = await getSession();
    if (!session || (session.role !== 'TEACHING' && session.role !== 'ADMIN')) {
        return { error: 'Unauthorized' };
    }

    try {
        // Allow ADMIN to close any session, Teacher only their own
        let query = 'UPDATE attendance_sessions SET is_active = false, ended_at = NOW() WHERE id = $1';
        let params = [sessionId];

        if (session.role === 'TEACHING') {
            query += ' AND teacher_id = $2';
            params.push(session.id);
        }

        await appDb.query(query, params);
        return { success: true };
    } catch (error) {
        console.error('Error ending session:', error);
        return { error: 'Failed to end session' };
    }
}

export async function getActiveSession(classroomId: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            'SELECT * FROM attendance_sessions WHERE classroom_id = $1 AND is_active = true',
            [classroomId]
        );
        return { session: result.rows[0] || null };
    } catch (error) {
        console.error('Error fetching session:', error);
        return { error: 'Failed to fetch session' };
    }
}

export async function getMyActiveSession() {
    const session = await getSession();
    if (!session || session.role !== 'TEACHING') {
        return { error: 'Unauthorized' };
    }

    try {
        // Get ANY active session for this teacher
        // Join with classroom info to restore UI state if needed
        const result = await appDb.query(
            `SELECT s.*, c.room_number, c.floor_id, f.building_id 
             FROM attendance_sessions s
             JOIN classrooms c ON s.classroom_id = c.id
             JOIN floors f ON c.floor_id = f.id
             WHERE s.teacher_id = $1 AND s.is_active = true`,
            [session.id]
        );

        if (result.rows.length === 0) return { session: null };

        // Check for staleness here too (safety double-check)
        const activeSession = result.rows[0];
        const startTime = new Date(activeSession.started_at).getTime();
        const hoursSinceStart = (Date.now() - startTime) / (1000 * 60 * 60);

        if (hoursSinceStart > 4) {
            await appDb.query('UPDATE attendance_sessions SET is_active = false WHERE id = $1', [activeSession.id]);
            return { session: null };
        }

        return { session: activeSession };
    } catch (error) {
        console.error('Error fetching my active session:', error);
        return { error: 'Failed to fetch session' };
    }
}

export async function getSessionAttendance(sessionId: number) {
    const session = await getSession();
    if (!session || (session.role !== 'TEACHING' && session.role !== 'ADMIN')) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            'SELECT * FROM attendance WHERE session_id = $1 ORDER BY marked_at DESC',
            [sessionId]
        );

        if (result.rows.length === 0) {
            return { attendance: [] };
        }

        // Get student IDs
        const studentIds = result.rows.map((r: any) => r.student_id);

        // Fetch student names from auth DB
        const studentResult = await authDb.query(
            `SELECT id, name, email FROM users WHERE id = ANY($1)`,
            [studentIds]
        );

        // Create a map of student ID to name
        const studentMap = new Map();
        studentResult.rows.forEach((s: any) => {
            studentMap.set(s.id, { name: s.name, email: s.email });
        });

        // Merge attendance with student names
        const attendanceWithNames = result.rows.map((a: any) => ({
            ...a,
            student_name: studentMap.get(a.student_id)?.name || 'Unknown',
            student_email: studentMap.get(a.student_id)?.email || ''
        }));

        return { attendance: attendanceWithNames };
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return { error: 'Failed to fetch attendance' };
    }
}

// ============ STUDENT ATTENDANCE ============

export async function markAttendance(qrToken: string, lat: number, lng: number) {
    const session = await getSession();
    if (!session || session.role !== 'STUDENT') {
        return { error: 'Unauthorized - Students only' };
    }

    try {
        // 1. Find session by QR token
        const sessionResult = await appDb.query(
            `SELECT s.*, c.floor_id, c.room_number 
             FROM attendance_sessions s
             JOIN classrooms c ON s.classroom_id = c.id
             WHERE s.qr_token = $1`,
            [qrToken]
        );

        if (sessionResult.rows.length === 0) {
            return { error: 'Invalid QR code' };
        }

        const attendanceSession = sessionResult.rows[0];

        // 2. Check session is active
        if (!attendanceSession.is_active) {
            return { error: 'Attendance session is not active' };
        }

        // 3. Check QR not expired
        if (new Date(attendanceSession.expires_at) < new Date()) {
            return { error: 'QR code has expired. Please scan new code.' };
        }

        // 3.5 Check if student is enrolled in this classroom
        const enrollmentCheck = await appDb.query(
            'SELECT 1 FROM student_classrooms WHERE student_id = $1 AND classroom_id = $2',
            [session.id, attendanceSession.classroom_id]
        );

        if (enrollmentCheck.rows.length === 0) {
            return { error: 'You are not enrolled in this classroom.' };
        }

        // 4. Check student not already marked
        const existingAttendance = await appDb.query(
            'SELECT * FROM attendance WHERE session_id = $1 AND student_id = $2',
            [attendanceSession.id, session.id]
        );

        if (existingAttendance.rows.length > 0) {
            return { error: 'You have already marked attendance for this session' };
        }

        // 5. Get floor location
        const floorResult = await appDb.query(
            'SELECT * FROM floors WHERE id = $1',
            [attendanceSession.floor_id]
        );

        if (floorResult.rows.length === 0) {
            return { error: 'Classroom floor not found' };
        }

        const floor = floorResult.rows[0];

        // Check if floor has location set
        if (!floor.center_lat || !floor.center_lng) {
            return { error: 'Attendance location not configured. Contact staff.' };
        }

        // 6. Calculate distance using Haversine
        const distance = haversineDistance(
            lat, lng,
            parseFloat(floor.center_lat),
            parseFloat(floor.center_lng)
        );

        // 7. Check if within radius
        if (distance > floor.radius_m) {
            return {
                error: `You are too far from the classroom (${Math.round(distance)}m away). Please move closer.`,
                distance: Math.round(distance),
                required: floor.radius_m
            };
        }

        // 8. Mark attendance
        await appDb.query(
            `INSERT INTO attendance (session_id, student_id, lat, lng, distance_m, status)
             VALUES ($1, $2, $3, $4, $5, 'PRESENT')`,
            [attendanceSession.id, session.id, lat, lng, Math.round(distance)]
        );

        return {
            success: true,
            message: 'Attendance marked successfully!',
            classroom: attendanceSession.room_number,
            distance: Math.round(distance)
        };
    } catch (error) {
        console.error('Error marking attendance:', error);
        return { error: 'Failed to mark attendance' };
    }
}

export async function getMyAttendanceHistory() {
    const session = await getSession();
    if (!session || session.role !== 'STUDENT') {
        return { error: 'Unauthorized - Students only' };
    }

    try {
        const result = await appDb.query(
            `SELECT a.*, s.started_at as session_date, c.room_number, f.floor_number, b.name as building_name
             FROM attendance a
             JOIN attendance_sessions s ON a.session_id = s.id
             JOIN classrooms c ON s.classroom_id = c.id
             JOIN floors f ON c.floor_id = f.id
             JOIN buildings b ON f.building_id = b.id
             WHERE a.student_id = $1
             ORDER BY a.marked_at DESC
             LIMIT 50`,
            [session.id]
        );
        return { history: result.rows };
    } catch (error) {
        console.error('Error fetching history:', error);
        return { error: 'Failed to fetch attendance history' };
    }
}

// ============ TEACHER HISTORY (with student names) ============

export async function getTeacherSessionsHistory(date?: string) {
    const session = await getSession();
    if (!session || session.role !== 'TEACHING') {
        return { error: 'Unauthorized - Teachers only' };
    }

    try {
        let query = `
            SELECT 
                s.id, s.started_at, s.is_active,
                c.room_number, f.floor_number, b.name as building_name,
                (SELECT COUNT(*) FROM attendance WHERE session_id = s.id) as student_count
            FROM attendance_sessions s
            JOIN classrooms c ON s.classroom_id = c.id
            JOIN floors f ON c.floor_id = f.id
            JOIN buildings b ON f.building_id = b.id
            WHERE s.teacher_id = $1
        `;

        const params: any[] = [session.id];

        if (date) {
            query += ` AND DATE(s.started_at) = $2`;
            params.push(date);
        }

        query += ` ORDER BY s.started_at DESC LIMIT 100`;

        const result = await appDb.query(query, params);
        return { sessions: result.rows };
    } catch (error) {
        console.error('Error fetching teacher sessions:', error);
        return { error: 'Failed to fetch sessions' };
    }
}

export async function getSessionAttendanceWithNames(sessionId: number) {
    const session = await getSession();
    if (!session || (session.role !== 'TEACHING' && session.role !== 'ADMIN')) {
        return { error: 'Unauthorized' };
    }

    try {
        // Get attendance records from app DB
        const attendanceResult = await appDb.query(
            `SELECT a.*, s.started_at as session_date, c.room_number, f.floor_number, b.name as building_name
             FROM attendance a
             JOIN attendance_sessions s ON a.session_id = s.id
             JOIN classrooms c ON s.classroom_id = c.id
             JOIN floors f ON c.floor_id = f.id
             JOIN buildings b ON f.building_id = b.id
             WHERE a.session_id = $1
             ORDER BY a.marked_at ASC`,
            [sessionId]
        );

        if (attendanceResult.rows.length === 0) {
            return { attendance: [], sessionInfo: null };
        }

        // Get student IDs
        const studentIds = attendanceResult.rows.map((r: any) => r.student_id);

        // Fetch student names from auth DB
        const studentResult = await authDb.query(
            `SELECT id, name, email FROM users WHERE id = ANY($1)`,
            [studentIds]
        );

        // Create a map of student ID to name
        const studentMap = new Map();
        studentResult.rows.forEach((s: any) => {
            studentMap.set(s.id, { name: s.name, email: s.email });
        });

        // Merge attendance with student names
        const attendanceWithNames = attendanceResult.rows.map((a: any) => ({
            ...a,
            student_name: studentMap.get(a.student_id)?.name || 'Unknown',
            student_email: studentMap.get(a.student_id)?.email || ''
        }));

        // Get session info
        const sessionInfo = {
            room_number: attendanceResult.rows[0].room_number,
            floor_number: attendanceResult.rows[0].floor_number,
            building_name: attendanceResult.rows[0].building_name,
            session_date: attendanceResult.rows[0].session_date
        };

        return { attendance: attendanceWithNames, sessionInfo };
    } catch (error) {
        console.error('Error fetching attendance with names:', error);
        return { error: 'Failed to fetch attendance' };
    }
}

