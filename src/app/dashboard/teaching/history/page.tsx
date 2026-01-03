'use client';

import { useState, useEffect } from 'react';
import { getTeacherSessionsHistory, getSessionAttendanceWithNames } from '../../../../actions/attendance';
import { History, Calendar, Users, MapPin, Clock, ChevronRight, X, User } from 'lucide-react';

interface Session {
    id: number;
    started_at: string;
    is_active: boolean;
    room_number: string;
    floor_number: number;
    building_name: string;
    student_count: number;
}

interface AttendanceRecord {
    id: number;
    student_id: number;
    student_name: string;
    student_email: string;
    distance_m: number;
    marked_at: string;
}

export default function TeacherHistoryPage() {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        loadSessions();
    }, [selectedDate]);

    async function loadSessions() {
        setLoading(true);
        const result = await getTeacherSessionsHistory(selectedDate);
        if (result.sessions) {
            setSessions(result.sessions);
        }
        setLoading(false);
    }

    async function viewSessionDetails(sessionId: number) {
        setLoadingAttendance(true);
        setSelectedSession(sessionId);

        const result = await getSessionAttendanceWithNames(sessionId);
        if (result.attendance) {
            setAttendance(result.attendance);
            setSessionInfo(result.sessionInfo);
        }
        setLoadingAttendance(false);
    }

    function formatTime(dateStr: string) {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    // Group sessions by date
    const sessionsByDate = sessions.reduce((acc: { [key: string]: Session[] }, session) => {
        const date = new Date(session.started_at).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {});

    return (
        <div className="flex-1 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                        <History size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Attendance History</h1>
                        <p className="text-gray-500 text-sm">View past attendance sessions and student records</p>
                    </div>
                </div>

                {/* Date Picker */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>

                {/* Sessions List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading...</div>
                    ) : sessions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <History size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No sessions found for {formatDate(selectedDate)}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
                                <div key={date}>
                                    <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
                                        {date}
                                    </div>
                                    {dateSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => viewSessionDetails(session.id)}
                                            className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.is_active ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                                    }`}>
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {session.building_name} - Room {session.room_number}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {formatTime(session.started_at)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <User size={14} />
                                                            {session.student_count} students
                                                        </span>
                                                        {session.is_active && (
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Session Details Modal */}
                {selectedSession && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold">Session Attendance</h3>
                                    {sessionInfo && (
                                        <p className="text-sm text-gray-500">
                                            {sessionInfo.building_name} - Room {sessionInfo.room_number}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 max-h-96 overflow-y-auto">
                                {loadingAttendance ? (
                                    <p className="text-center text-gray-400 py-8">Loading...</p>
                                ) : attendance.length === 0 ? (
                                    <p className="text-center text-gray-400 py-8">No attendance records</p>
                                ) : (
                                    <div className="space-y-2">
                                        {attendance.map((record, index) => (
                                            <div
                                                key={record.id}
                                                className="flex items-center justify-between p-3 bg-green-50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{record.student_name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">{formatTime(record.marked_at)}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        {record.distance_m}m
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <p className="text-center text-sm text-gray-600">
                                    Total: <strong>{attendance.length}</strong> students attended
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
