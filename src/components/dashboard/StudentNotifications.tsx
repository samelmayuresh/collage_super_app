'use client';

import { useState, useEffect } from 'react';
import { EventsCard, AnnouncementsCard, AlertsPanel, AttendanceWarning } from './EventsAlerts';

interface Props {
    userId: number;
    userRole: string;
}

export function StudentNotifications({ userId, userRole }: Props) {
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [attendance, setAttendance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch events
            const eventsRes = await fetch('/api/events?upcoming=true');
            if (eventsRes.ok) {
                const data = await eventsRes.json();
                setEvents(data.events || []);
            }

            // Fetch announcements
            const announcementsRes = await fetch(`/api/announcements?role=${userRole}`);
            if (announcementsRes.ok) {
                const data = await announcementsRes.json();
                setAnnouncements(data.announcements || []);
            }

            // Fetch alerts
            const alertsRes = await fetch(`/api/alerts?userId=${userId}`);
            if (alertsRes.ok) {
                const data = await alertsRes.json();
                setAlerts(data.alerts || []);
            }

            // Fetch attendance percentage
            const attendanceRes = await fetch(`/api/attendance/summary?userId=${userId}`);
            if (attendanceRes.ok) {
                const data = await attendanceRes.json();
                setAttendance(data.percentage);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
        setLoading(false);
    };

    const handleMarkAlertRead = async (alertId: number) => {
        try {
            await fetch(`/api/alerts/${alertId}/read`, { method: 'POST' });
        } catch (error) {
            console.error('Error marking alert read:', error);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-24 bg-gray-200 rounded-2xl"></div>
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Attendance Warning Banner */}
            {attendance !== null && attendance < 75 && (
                <AttendanceWarning percentage={attendance} />
            )}

            {/* Alerts Panel */}
            {alerts.length > 0 && (
                <AlertsPanel alerts={alerts} onMarkRead={handleMarkAlertRead} />
            )}

            {/* Events and Announcements Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EventsCard events={events} />
                <AnnouncementsCard announcements={announcements} />
            </div>
        </div>
    );
}

// Static version for server-side rendered dashboards with sample data
export function StudentNotificationsStatic() {
    const sampleEvents = [
        {
            id: 1,
            title: 'Annual Sports Day',
            description: 'Join us for the annual sports day celebration with various competitions.',
            event_type: 'sports',
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Main Ground',
            is_mandatory: false
        },
        {
            id: 2,
            title: 'Technical Workshop',
            description: 'Learn about latest web development technologies and best practices.',
            event_type: 'workshop',
            start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Lab 101',
            is_mandatory: true
        }
    ];

    const sampleAnnouncements = [
        {
            id: 1,
            title: 'Exam Schedule Released',
            content: 'The final examination schedule has been released. Check your student portal for details.',
            priority: 'high',
            is_pinned: true,
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: 'Library Hours Extended',
            content: 'Library will remain open until 10 PM during exam week.',
            priority: 'normal',
            is_pinned: false,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EventsCard events={sampleEvents} />
                <AnnouncementsCard announcements={sampleAnnouncements} />
            </div>
        </div>
    );
}
