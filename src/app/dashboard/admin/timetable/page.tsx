'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Loader2, User } from 'lucide-react';
import { getTeacherAssignments } from '../../../../actions/classes';
import { createCalendarEvent, getEventsForTeacher } from '../../../../actions/calendar';
import { getUsersByRole } from '../../../../actions/auth';

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

interface Teacher {
    id: number;
    name: string;
    email: string;
}

const EVENT_TYPES = [
    { value: 'lecture', label: 'Lecture', color: 'bg-blue-500' },
    { value: 'exam', label: 'Exam', color: 'bg-red-500' },
    { value: 'assignment', label: 'Assignment', color: 'bg-yellow-500' },
    { value: 'meeting', label: 'Meeting', color: 'bg-purple-500' },
    { value: 'holiday', label: 'Holiday', color: 'bg-green-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

export default function AdminTimetablePage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);
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

    // Load teachers on mount
    useEffect(() => {
        getUsersByRole('TEACHING').then(res => {
            if (res.users) setTeachers(res.users);
        });
    }, []);

    // Load schedule when teacher or date changes
    useEffect(() => {
        if (selectedTeacherId) {
            loadSchedule();
        } else {
            setEvents([]);
            setAssignments([]);
        }
    }, [selectedTeacherId, currentDate]);

    async function loadSchedule() {
        if (!selectedTeacherId) return;
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const teacherId = parseInt(selectedTeacherId);

        const [eventsRes, assignmentsRes] = await Promise.all([
            getEventsForTeacher(startDate, endDate, teacherId),
            getTeacherAssignments(teacherId)
        ]);

        if (eventsRes.events) setEvents(eventsRes.events);
        if (assignmentsRes.assignments) setAssignments(assignmentsRes.assignments);
        setLoading(false);
    }

    // Filter subjects based on selected class
    const filteredSubjects = eventClass
        ? assignments.filter(a => a.class_id === parseInt(eventClass))
        : [];

    // Get unique classes from assignments
    const uniqueClasses = assignments.reduce((acc, a) => {
        if (!acc.find(c => c.class_id === a.class_id)) {
            acc.push({ class_id: a.class_id, class_name: a.class_name, section: a.section });
        }
        return acc;
    }, [] as { class_id: number; class_name: string; section: string }[]);

    async function handleCreateEvent(e: React.FormEvent) {
        e.preventDefault();
        if (!eventTitle || !selectedDate || !eventClass || !selectedTeacherId) return;

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
            teacherId: parseInt(selectedTeacherId) // Pass overriding teacher ID
        });
        setSubmitting(false);
        resetForm();
        setShowModal(false);
        loadSchedule();
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
            // Handle both string and Date object
            const eventDateStr = typeof e.event_date === 'string'
                ? e.event_date.split('T')[0]
                : new Date(e.event_date).toISOString().split('T')[0];
            return eventDateStr === dateStr;
        });
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Teacher Timetables</h1>
                        <p className="text-gray-500">Manage schedules for teachers</p>
                    </div>

                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm min-w-[250px]">
                        <div className="relative">
                            <select
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-transparent rounded-lg focus:outline-none appearance-none cursor-pointer font-medium text-slate-700"
                            >
                                <option value="">Select a Teacher...</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {!selectedTeacherId ? (
                    <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-dashed border-gray-300">
                        <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold text-gray-500 mb-1">No Teacher Selected</h3>
                        <p>Please select a teacher from the dropdown to view or manage their timetable.</p>
                    </div>
                ) : (
                    <>
                        {/* Calendar Header */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b">
                                <button
                                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <h2 className="text-xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
                                <button
                                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Days of Week Header */}
                            <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-100">
                                {daysOfWeek.map(day => (
                                    <div key={day} className="p-3 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 relative">
                                {loading && (
                                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-purple-600" size={32} />
                                    </div>
                                )}
                                {calendarDays.slice(0, 35).map((item, index) => {
                                    const dayEvents = item.date ? getEventsForDate(item.date) : [];
                                    return (
                                        <div
                                            key={index}
                                            className={`min-h-[120px] border-b border-r p-2 transition-colors ${!item.isCurrentMonth ? 'bg-gray-50/30' : 'bg-white hover:bg-gray-50/30'} ${item.isToday ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${item.isToday ? 'bg-blue-600 text-white shadow-blue-200 shadow-md' : item.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                                                    {item.day}
                                                </span>
                                                {item.isCurrentMonth && (
                                                    <button
                                                        onClick={() => openModalForDate(item.date)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                {dayEvents.slice(0, 3).map(event => {
                                                    const typeInfo = EVENT_TYPES.find(t => t.value === event.event_type);
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className={`text-[10px] px-2 py-1 rounded-md font-medium truncate text-white shadow-sm cursor-help ${typeInfo?.color || 'bg-gray-500'}`}
                                                            title={`${event.title} (${event.start_time}-${event.end_time})`}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-[10px] text-gray-400 font-medium pl-1">+{dayEvents.length - 3} more</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                            {EVENT_TYPES.map(type => (
                                <div key={type.value} className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                    <div className={`w-2.5 h-2.5 rounded-full ${type.color}`}></div>
                                    <span className="text-gray-600 font-medium">{type.label}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in fade-in duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-slate-800">Add Schedule Slot</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-5 space-y-4">
                            <div className="bg-blue-50/50 p-3 rounded-xl flex items-center gap-3 text-blue-900 text-sm font-medium">
                                <CalendarIcon size={16} className="text-blue-500" />
                                <span>{new Date(selectedDate || '').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Class *</label>
                                <select
                                    value={eventClass}
                                    onChange={(e) => { setEventClass(e.target.value); setEventSubject(''); }}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {uniqueClasses.map(c => (
                                        <option key={c.class_id} value={c.class_id}>{c.class_name} {c.section || ''}</option>
                                    ))}
                                </select>
                                {uniqueClasses.length === 0 && (
                                    <p className="text-xs text-orange-500 mt-1">This teacher has no classes assigned.</p>
                                )}
                            </div>

                            {eventClass && filteredSubjects.length > 0 && (
                                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Subject</label>
                                    <select
                                        value={eventSubject}
                                        onChange={(e) => setEventSubject(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700"
                                    >
                                        <option value="">Select Subject (optional)</option>
                                        {filteredSubjects.map(s => (
                                            <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Event Title *</label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700"
                                    placeholder="e.g., Physics Lecture"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
                                    <select
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700"
                                    >
                                        {EVENT_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Start Time</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                                <textarea
                                    value={eventDescription}
                                    onChange={(e) => setEventDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700"
                                    rows={2}
                                    placeholder="Optional details..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-blue-200 shadow-lg mt-2"
                            >
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                Add Schedule Slot
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
