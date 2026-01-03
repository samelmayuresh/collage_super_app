'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Book, Loader2, User } from 'lucide-react';
import { getEventsForStudent } from '../../../../actions/calendar';
import { getStudentClass } from '../../../../actions/classes';

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

export default function StudentCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [studentClass, setStudentClass] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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

        const [eventsRes, classRes] = await Promise.all([
            getEventsForStudent(startDate, endDate),
            getStudentClass()
        ]);

        if (eventsRes.events) setEvents(eventsRes.events);
        if (classRes.enrollment) setStudentClass(classRes.enrollment);
        setLoading(false);
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
        return events.filter(e => e.event_date?.split('T')[0] === dateStr);
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#FAEFE9]">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">My Calendar</h1>
                        {studentClass && (
                            <p className="text-gray-500">Class: {studentClass.class_name} {studentClass.section || ''}</p>
                        )}
                    </div>
                </div>

                {!studentClass ? (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <User size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="font-bold text-xl mb-2">Not Enrolled</h2>
                        <p className="text-gray-500">You are not enrolled in any class yet. Contact your teacher or admin.</p>
                    </div>
                ) : (
                    <>
                        {/* Calendar */}
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

                            <div className="grid grid-cols-7 bg-gray-50">
                                {daysOfWeek.map(day => (
                                    <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7">
                                {calendarDays.slice(0, 35).map((item, index) => {
                                    const dayEvents = item.date ? getEventsForDate(item.date) : [];
                                    return (
                                        <div
                                            key={index}
                                            className={`min-h-[100px] border-t border-r p-2 ${!item.isCurrentMonth ? 'bg-gray-50 text-gray-300' : 'bg-white'
                                                } ${item.isToday ? 'bg-orange-50' : ''}`}
                                        >
                                            <span className={`text-sm font-medium ${item.isToday ? 'bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                                {item.day}
                                            </span>
                                            <div className="space-y-1 mt-1">
                                                {dayEvents.slice(0, 2).map(event => {
                                                    const typeInfo = EVENT_TYPES.find(t => t.value === event.event_type);
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            onClick={() => setSelectedEvent(event)}
                                                            className={`text-xs p-1 rounded truncate text-white cursor-pointer hover:opacity-80 ${typeInfo?.color || 'bg-gray-500'}`}
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

                        {/* Legend */}
                        <div className="mt-4 flex flex-wrap gap-4">
                            {EVENT_TYPES.map(type => (
                                <div key={type.value} className="flex items-center gap-2 text-sm">
                                    <div className={`w-3 h-3 rounded ${type.color}`}></div>
                                    <span>{type.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Upcoming Events */}
                        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4">Upcoming Events</h2>
                            {events.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No events this month</p>
                            ) : (
                                <div className="space-y-3">
                                    {events.slice(0, 5).map(event => {
                                        const typeInfo = EVENT_TYPES.find(t => t.value === event.event_type);
                                        return (
                                            <div key={event.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                                                <div className={`w-3 h-3 rounded-full mt-1.5 ${typeInfo?.color}`}></div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{event.title}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        {event.start_time && ` • ${event.start_time.slice(0, 5)}`}
                                                    </p>
                                                    {event.subject_name && (
                                                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded mt-1 inline-block">{event.subject_name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-xl mb-2">{selectedEvent.title}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <CalendarIcon size={16} />
                                {new Date(selectedEvent.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            {selectedEvent.start_time && (
                                <p className="flex items-center gap-2">
                                    <Clock size={16} />
                                    {selectedEvent.start_time.slice(0, 5)} - {selectedEvent.end_time?.slice(0, 5) || ''}
                                </p>
                            )}
                            {selectedEvent.subject_name && (
                                <p className="flex items-center gap-2">
                                    <Book size={16} />
                                    {selectedEvent.subject_name}
                                </p>
                            )}
                            {selectedEvent.description && (
                                <p className="mt-4 p-3 bg-gray-50 rounded-xl">{selectedEvent.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="mt-4 w-full py-2 bg-gray-100 rounded-xl font-medium hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
