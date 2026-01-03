'use client';

import { useState, useEffect } from 'react';
import { getTeacherSessionsHistory, getSessionAttendanceWithNames } from '../../../../actions/attendance';
import { getTeacherClassrooms } from '../../../../actions/classroomAssignments'; // Updated import
import { getStudentAttendanceStats } from '../../../../actions/analytics';
import { History, Calendar, Users, MapPin, Clock, ChevronRight, X, User, Loader2 } from 'lucide-react';

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

interface Classroom {
    id: number;
    classroom_id: number;
    room_number: string;
    floor_number: number;
    building_name: string;
    subject_name?: string;
}

export default function TeacherHistoryPage() {
    const [viewMode, setViewMode] = useState<'sessions' | 'class'>('sessions');

    // Session View State
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [sessions, setSessions] = useState<Session[]>([]);

    // Class View State
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
    const [studentStats, setStudentStats] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (viewMode === 'sessions') {
            loadSessions();
        } else if (viewMode === 'class' && selectedClassroomId) {
            loadClassStats();
        }
    }, [viewMode, selectedDate, selectedClassroomId]);

    async function loadInitialData() {
        setLoading(true);
        const [assignmentsRes] = await Promise.all([
            getTeacherClassrooms(),
            // Load initial sessions
            getTeacherSessionsHistory(selectedDate)
        ]);

        if (assignmentsRes.classrooms) {
            // Map to local interface if needed, or just use directly
            // The action returns flat objects with classroom_id
            setClassrooms(assignmentsRes.classrooms);

            if (assignmentsRes.classrooms.length > 0) {
                // Use classroom_id for selection
                setSelectedClassroomId(assignmentsRes.classrooms[0].classroom_id.toString());
            }
        }

        // Initial session load handled by state init, but we can set it here too if needed
        // The second useEffect will catch the initial render if we don't block
        setLoading(false);
    }

    async function loadSessions() {
        setLoading(true);
        const result = await getTeacherSessionsHistory(selectedDate);
        if (result.sessions) {
            setSessions(result.sessions);
        }
        setLoading(false);
    }

    async function loadClassStats() {
        if (!selectedClassroomId) return;
        setLoading(true);
        setError(null);
        setStudentStats([]); // Reset stats while loading

        try {
            const result = await getStudentAttendanceStats(parseInt(selectedClassroomId));
            if (result.error) {
                setError(result.error);
            } else if (result.students) {
                setStudentStats(result.students);
            }
        } catch (err) {
            setError('Failed to fetch class report');
        } finally {
            setLoading(false);
        }
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
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-purple-200 shadow-lg">
                            <History size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Attendance History</h1>
                            <p className="text-gray-500 text-sm">View past sessions and analytics</p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
                        <button
                            onClick={() => setViewMode('sessions')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'sessions' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="flex items-center gap-2">
                                <Calendar size={16} />
                                Daily Sessions
                            </span>
                        </button>
                        <button
                            onClick={() => setViewMode('class')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'class' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="flex items-center gap-2">
                                <Users size={16} />
                                Class Report
                            </span>
                        </button>
                    </div>
                </div>

                {viewMode === 'sessions' ? (
                    <>
                        {/* Date Picker */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
                            <Calendar size={20} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="flex-1 text-sm bg-gray-50 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        {/* Sessions List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <Clock className="mb-2 animate-pulse" size={32} />
                                    <p>Loading sessions...</p>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <History size={48} className="mb-4 opacity-20" />
                                    <p>No sessions found for {formatDate(selectedDate)}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
                                        <div key={date}>
                                            <div className="bg-gray-50/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 border-y border-gray-100">
                                                {date}
                                            </div>
                                            {dateSessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    onClick={() => viewSessionDetails(session.id)}
                                                    className="p-4 flex items-center justify-between hover:bg-purple-50 cursor-pointer transition-colors group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${session.is_active ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                                            }`}>
                                                            <Users size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {session.building_name} <span className="text-gray-400 mx-1">•</span> Room {session.room_number}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Clock size={14} className="text-gray-400" />
                                                                    {formatTime(session.started_at)}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <User size={14} className="text-gray-400" />
                                                                    {session.student_count} present
                                                                </span>
                                                                {session.is_active && (
                                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-purple-200 group-hover:text-purple-700 transition-colors">
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Class Filter */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Select Classroom</label>
                                <select
                                    value={selectedClassroomId}
                                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700"
                                >
                                    <option value="">-- Choose a Classroom --</option>
                                    {classrooms.map(c => (
                                        <option key={c.classroom_id} value={c.classroom_id}>
                                            {c.building_name} - Room {c.room_number} {c.subject_name ? `(${c.subject_name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Student Stats Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                            {!selectedClassroomId ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <Users size={48} className="mb-4 opacity-20" />
                                    <p>Select a class to view student report</p>
                                </div>
                            ) : loading ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <Clock className="mb-2 animate-pulse" size={32} />
                                    <p>Generating report...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-64 text-red-400">
                                    <p>{error}</p>
                                    <button
                                        onClick={loadClassStats}
                                        className="mt-2 text-sm text-purple-600 hover:underline"
                                    >
                                        <option value="">-- Choose a Classroom --</option>
                                        {classrooms.map(c => (
                                            <option key={c.classroom_id} value={c.classroom_id}>
                                                {c.building_name} - Room {c.room_number} {c.subject_name ? `(${c.subject_name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        {/* Student Stats Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                            {!selectedClassroomId ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <Users size={48} className="mb-4 opacity-20" />
                                    <p>Select a class to view student report</p>
                                </div>
                            ) : loading ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <Clock className="mb-2 animate-pulse" size={32} />
                                    <p>Generating report...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-64 text-red-400">
                                    <p>{error}</p>
                                    <button
                                        onClick={loadClassStats}
                                        className="mt-2 text-sm text-purple-600 hover:underline"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : studentStats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <Users size={48} className="mb-4 opacity-20" />
                                    <p>No students are enrolled in this class.</p>
                                    <p className="text-sm mt-1">Go to "My Students" to enroll students.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                                <th className="p-4">Roll No</th>
                                                <th className="p-4">Student Name</th>
                                                <th className="p-4 text-center">Sessions Held</th>
                                                <th className="p-4 text-center">Attended</th>
                                                <th className="p-4">Attendance %</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {studentStats.map((stat) => {
                                                const percentage = stat.total_sessions > 0
                                                    ? Math.round((stat.present_count / stat.total_sessions) * 100)
                                                    : 0;

                                                let statusColor = 'text-green-600';
                                                if (percentage < 75) statusColor = 'text-orange-500';
                                                if (percentage < 50) statusColor = 'text-red-500';

                                                return (
                                                    <tr key={stat.student_id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-mono text-sm text-gray-500">{stat.roll_number || '-'}</td>
                                                        <td className="p-4">
                                                            <div>
                                                                <p className="font-semibold text-slate-700">{stat.name}</p>
                                                                <p className="text-xs text-gray-400">{stat.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center font-medium text-gray-600">{stat.total_sessions}</td>
                                                        <td className="p-4 text-center font-medium text-gray-600">{stat.present_count}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                                                                    <div
                                                                        className={`h-full rounded-full ${percentage < 50 ? 'bg-red-500' : percentage < 75 ? 'bg-orange-400' : 'bg-green-500'}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`text-sm font-bold ${statusColor}`}>{percentage}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* (Keep existing Session Details Modal logic as is) */}
                {selectedSession && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-slate-800">Session Attendance</h3>
                                    {sessionInfo && (
                                        <p className="text-sm text-gray-500">
                                            {sessionInfo.building_name} • Room {sessionInfo.room_number}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-0 max-h-96 overflow-y-auto">
                                {loadingAttendance ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <Loader2 className="animate-spin mb-2" size={24} />
                                        <p>Fetching records...</p>
                                    </div>
                                ) : attendance.length === 0 ? (
                                    <div className="py-12 text-center text-gray-400">
                                        <p>No attendance records found.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {attendance.map((record, index) => (
                                            <div
                                                key={record.id}
                                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{record.student_name}</p>
                                                        <p className="text-xs text-gray-400">{record.student_email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-mono text-gray-500 mb-0.5">{formatTime(record.marked_at)}</p>
                                                    <div className="flex items-center justify-end gap-1 text-[10px] uppercase font-bold tracking-wide text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-flex">
                                                        <MapPin size={10} />
                                                        {record.distance_m}m
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-sm">
                                <span className="text-gray-500">Total Present:</span>
                                <strong className="text-slate-800 text-lg">{attendance.length}</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
