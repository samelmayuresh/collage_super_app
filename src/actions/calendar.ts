'use server';

import { appDb } from '../../lib/db';
import { getSession } from './auth';

// ============ CALENDAR EVENTS ============

export async function createCalendarEvent(data: {
    classId: number;
    subjectId?: number;
    title: string;
    description?: string;
    eventType: string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
}) {
    const session = await getSession();
    if (!session || session.role !== 'TEACHING') {
        return { error: 'Unauthorized - Teachers only' };
    }

    try {
        const result = await appDb.query(
            `INSERT INTO calendar_events 
             (teacher_id, class_id, subject_id, title, description, event_type, event_date, start_time, end_time, is_recurring, recurrence_pattern)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                session.id,
                data.classId,
                data.subjectId || null,
                data.title,
                data.description || null,
                data.eventType,
                data.eventDate,
                data.startTime || null,
                data.endTime || null,
                data.isRecurring || false,
                data.recurrencePattern || null
            ]
        );
        return { success: true, event: result.rows[0] };
    } catch (error) {
        console.error('Error creating event:', error);
        return { error: 'Failed to create event' };
    }
}

export async function getEventsForTeacher(startDate?: string, endDate?: string) {
    const session = await getSession();
    if (!session || session.role !== 'TEACHING') {
        return { error: 'Unauthorized' };
    }

    try {
        let query = `
            SELECT ce.*, c.name as class_name, c.section, s.name as subject_name
            FROM calendar_events ce
            LEFT JOIN classes c ON ce.class_id = c.id
            LEFT JOIN subjects s ON ce.subject_id = s.id
            WHERE ce.teacher_id = $1
        `;
        const params: any[] = [session.id];

        if (startDate && endDate) {
            query += ` AND ce.event_date BETWEEN $2 AND $3`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY ce.event_date, ce.start_time`;

        const result = await appDb.query(query, params);
        return { events: result.rows };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { error: 'Failed to fetch events' };
    }
}

export async function getEventsForStudent(startDate?: string, endDate?: string) {
    const session = await getSession();
    if (!session || session.role !== 'STUDENT') {
        return { error: 'Unauthorized - Students only' };
    }

    try {
        // Get student's class first
        const classResult = await appDb.query(
            'SELECT class_id FROM student_classes WHERE student_id = $1',
            [session.id]
        );

        if (classResult.rows.length === 0) {
            return { events: [], message: 'Not enrolled in any class' };
        }

        const classId = classResult.rows[0].class_id;

        let query = `
            SELECT ce.*, c.name as class_name, c.section, s.name as subject_name
            FROM calendar_events ce
            LEFT JOIN classes c ON ce.class_id = c.id
            LEFT JOIN subjects s ON ce.subject_id = s.id
            WHERE ce.class_id = $1
        `;
        const params: any[] = [classId];

        if (startDate && endDate) {
            query += ` AND ce.event_date BETWEEN $2 AND $3`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY ce.event_date, ce.start_time`;

        const result = await appDb.query(query, params);
        return { events: result.rows };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { error: 'Failed to fetch events' };
    }
}

export async function getEventsForClass(classId: number, startDate?: string, endDate?: string) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        let query = `
            SELECT ce.*, c.name as class_name, c.section, s.name as subject_name
            FROM calendar_events ce
            LEFT JOIN classes c ON ce.class_id = c.id
            LEFT JOIN subjects s ON ce.subject_id = s.id
            WHERE ce.class_id = $1
        `;
        const params: any[] = [classId];

        if (startDate && endDate) {
            query += ` AND ce.event_date BETWEEN $2 AND $3`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY ce.event_date, ce.start_time`;

        const result = await appDb.query(query, params);
        return { events: result.rows };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { error: 'Failed to fetch events' };
    }
}

export async function updateCalendarEvent(eventId: number, data: {
    title?: string;
    description?: string;
    eventType?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
}) {
    const session = await getSession();
    if (!session || session.role !== 'TEACHING') {
        return { error: 'Unauthorized' };
    }

    try {
        // Verify ownership
        const check = await appDb.query(
            'SELECT * FROM calendar_events WHERE id = $1 AND teacher_id = $2',
            [eventId, session.id]
        );

        if (check.rows.length === 0) {
            return { error: 'Event not found or not authorized' };
        }

        const updates: string[] = [];
        const params: any[] = [];
        let paramCount = 1;

        if (data.title) {
            updates.push(`title = $${paramCount++}`);
            params.push(data.title);
        }
        if (data.description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            params.push(data.description);
        }
        if (data.eventType) {
            updates.push(`event_type = $${paramCount++}`);
            params.push(data.eventType);
        }
        if (data.eventDate) {
            updates.push(`event_date = $${paramCount++}`);
            params.push(data.eventDate);
        }
        if (data.startTime !== undefined) {
            updates.push(`start_time = $${paramCount++}`);
            params.push(data.startTime);
        }
        if (data.endTime !== undefined) {
            updates.push(`end_time = $${paramCount++}`);
            params.push(data.endTime);
        }

        if (updates.length === 0) {
            return { error: 'No updates provided' };
        }

        params.push(eventId);
        await appDb.query(
            `UPDATE calendar_events SET ${updates.join(', ')} WHERE id = $${paramCount}`,
            params
        );

        return { success: true };
    } catch (error) {
        console.error('Error updating event:', error);
        return { error: 'Failed to update event' };
    }
}

export async function deleteCalendarEvent(eventId: number) {
    const session = await getSession();
    if (!session || (session.role !== 'TEACHING' && session.role !== 'ADMIN')) {
        return { error: 'Unauthorized' };
    }

    try {
        let query = 'DELETE FROM calendar_events WHERE id = $1';
        const params: any[] = [eventId];

        // Teachers can only delete their own events
        if (session.role === 'TEACHING') {
            query += ' AND teacher_id = $2';
            params.push(session.id);
        }

        await appDb.query(query, params);
        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        return { error: 'Failed to delete event' };
    }
}
