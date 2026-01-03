'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, Book, Loader2 } from 'lucide-react';
import { getTeacherAssignments } from '../../../../actions/classes';
import { createCalendarEvent, getEventsForTeacher } from '../../../../actions/calendar';

interface Assignment {
    id: number;
    class_id: number;
    subject_id: number;
    class_name: string;
    section: string;
    subject_name: string;
}

interface CalendarEvent {
    id: number;
    title: string;
    description: string;
    event_type: string;
    event_date: string;
    start_time: string;
    end_time: string;
    class_name: string;
    subject_name: string;
}

const EVENT_TYPES = [
    { value: 'lecture', label: 'Lecture', color: 'bg-blue-500' },
    { value: 'exam', label: 'Exam', color: 'bg-red-500' },
    { value: 'assignment', label: 'Assignment', color: 'bg-yellow-500' },
    { value: 'meeting', label: 'Meeting', color: 'bg-purple-500' },
    { value: 'holiday', label: 'Holiday', color: 'bg-green-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

export default function TeacherCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventType, setEventType] = useState('lecture');
    const [eventClass, setEventClass] = useState('');
    const [eventSubject, setEventSubject] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        loadData();
    }, [currentDate]);

    async function loadData() {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const [eventsRes, assignmentsRes] = await Promise.all([
            getEventsForTeacher(startDate, endDate),
            getTeacherAssignments()
        ]);

        if (eventsRes.events) setEvents(eventsRes.events);
        if (assignmentsRes.assignments) setAssignments(assignmentsRes.assignments);
        setLoading(false);
    }

    // Filter subjects based on selected class
    const filteredSubjects = eventClass
        ? assignments.filter(a => a.class_id === parseInt(eventClass))
        : [];

    async function handleCreateEvent(e: React.FormEvent) {
        e.preventDefault();
        if (!eventTitle || !selectedDate || !eventClass) return;

        setSubmitting(true);
        await createCalendarEvent({
            classId: parseInt(eventClass),
            subjectId: eventSubject ? parseInt(eventSubject) : undefined,
            title: eventTitle,
            description: eventDescription,
            eventType: eventType,
            eventDate: selectedDate,
            startTime: startTime,
            endTime: endTime,
        });
        setSubmitting(false);
        resetForm();
        setShowModal(false);
        loadData();
    }

    function resetForm() {
        setEventTitle('');
        setEventDescription('');
        setEventType('lecture');
        setEventClass('');
        setEventSubject('');
        setStartTime('09:00');
        setEndTime('10:00');
    }

    function openModalForDate(dateStr: string) {
        setSelectedDate(dateStr);
        setShowModal(true);
    }

    // Calendar grid logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const calendarDays = [];
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: '' });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        calendarDays.push({
            day: i,
            isCurrentMonth: true,
            date: dateStr,
            isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear()
        });
    }

    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({ day: i, isCurrentMonth: false, date: '' });
    }

    function getEventsForDate(dateStr: string) {
        return events.filter(e => {
            if (!e.event_date) return false;
            const eventDateStr = typeof e.event_date === 'string'
                ? e.event_date.split('T')[0]
                : new Date(e.event_date).toISOString().split('T')[0];
            return eventDateStr === dateStr;
        });
    }

    // Get unique classes from assignments
    const uniqueClasses = assignments.reduce((acc, a) => {
        if (!acc.find(c => c.class_id === a.class_id)) {
            acc.push({ class_id: a.class_id, class_name: a.class_name, section: a.section });
        }
        return acc;
    }, [] as { class_id: number; class_name: string; section: string }[]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Academic Calendar</h1>
                        <p className="text-gray-500">Manage your classes, exams, and events</p>
                    </div>
                </div>

                {/* Calendar Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b">
                        <button
                            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold">{monthNames[month]} {year}</h2>
                        <button
                            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 bg-gray-50">
                        {daysOfWeek.map(day => (
                            <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.slice(0, 35).map((item, index) => {
                            const dayEvents = item.date ? getEventsForDate(item.date) : [];
                            return (
                                <div
                                    key={index}
                                    className={`min-h-[100px] border-t border-r p-2 ${!item.isCurrentMonth ? 'bg-gray-50 text-gray-300' : 'bg-white'
                                        } ${item.isToday ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-sm font-medium ${item.isToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                            {item.day}
                                        </span>
                                        {item.isCurrentMonth && (
                                            <button
                                                onClick={() => openModalForDate(item.date)}
                                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 2).map(event => {
                                            const typeInfo = EVENT_TYPES.find(t => t.value === event.event_type);
                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`text-xs p-1 rounded truncate text-white ${typeInfo?.color || 'bg-gray-500'}`}
                                                >
                                                    {event.title}
                                                </div>
                                            );
                                        })}
                                        {dayEvents.length > 2 && (
                                            <div className="text-xs text-gray-400">+{dayEvents.length - 2} more</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Event Type Legend */}
                <div className="mt-4 flex flex-wrap gap-4">
                    {EVENT_TYPES.map(type => (
                        <div key={type.value} className="flex items-center gap-2 text-sm">
                            <div className={`w-3 h-3 rounded ${type.color}`}></div>
                            <span>{type.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-bold text-lg">Create Event</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                    <CalendarIcon size={16} className="text-gray-500" />
                                    <span>{selectedDate}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Event Title *</label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                    placeholder="e.g., Physics Lecture"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Event Type</label>
                                <select
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                >
                                    {EVENT_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Class *</label>
                                <select
                                    value={eventClass}
                                    onChange={(e) => { setEventClass(e.target.value); setEventSubject(''); }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {uniqueClasses.map(c => (
                                        <option key={c.class_id} value={c.class_id}>{c.class_name} {c.section || ''}</option>
                                    ))}
                                </select>
                            </div>

                            {eventClass && filteredSubjects.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject</label>
                                    <select
                                        value={eventSubject}
                                        onChange={(e) => setEventSubject(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Subject (optional)</option>
                                        {filteredSubjects.map(s => (
                                            <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={eventDescription}
                                    onChange={(e) => setEventDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                    rows={3}
                                    placeholder="Optional details..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                Create Event
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
