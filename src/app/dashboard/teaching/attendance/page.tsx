'use client';

import { useState, useEffect, useRef } from 'react';
import { getTeacherClassrooms } from '../../../../actions/classroomAssignments';
import { startAttendanceSession, refreshQRToken, endAttendanceSession, getMyActiveSession, getSessionAttendance } from '../../../../actions/attendance';
import { QrCode, Play, Square, Users, RefreshCw, Loader2, GitBranch, MapPin, Book } from 'lucide-react';
import QRCode from 'qrcode';

interface Classroom {
    id: number; // teacher_classrooms ID (optional, but we use classroom_id)
    classroom_id: number;
    room_number: string;
    floor_number: number;
    building_name: string;
    subject_id?: number;
    subject_name?: string;
}

interface AttendanceRecord {
    id: number;
    student_id: number;
    student_name?: string;
    student_email?: string;
    distance_m: number;
    marked_at: string;
}

export default function TeacherAttendancePage() {
    const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);

    const [activeSession, setActiveSession] = useState<any>(null);
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    const [loading, setLoading] = useState(true); // Initial load
    const [actionLoading, setActionLoading] = useState(false); // Start/End session
    const [error, setError] = useState<string | null>(null);
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);
    const attendanceInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadData();
        return () => {
            stopIntervals();
        };
    }, []);

    async function loadData() {
        setLoading(true);
        const [classroomsRes, sessionRes] = await Promise.all([
            getTeacherClassrooms(),
            getMyActiveSession()
        ]);

        if (classroomsRes.classrooms) {
            setMyClassrooms(classroomsRes.classrooms);
        }

        if (sessionRes.session) {
            restoreSession(sessionRes.session);
        }
        setLoading(false);
    }

    async function restoreSession(session: any) {
        setActiveSession(session);
        setQrToken(session.qr_token);
        setExpiresAt(session.expires_at);
        setSelectedClassroomId(session.classroom_id);

        // Fetch live attendance immediately
        const attResult = await getSessionAttendance(session.id);
        if (attResult.attendance) setAttendance(attResult.attendance);

        // Restart intervals
        startIntervals(session.id);
    }

    function startIntervals(sessionId: number) {
        stopIntervals(); // Clear existing if any

        // Start auto-refresh every 18 seconds
        refreshInterval.current = setInterval(async () => {
            const refreshResult = await refreshQRToken(sessionId);
            if (refreshResult.qrToken) {
                setQrToken(refreshResult.qrToken);
                setExpiresAt(refreshResult.expiresAt!);
            }
        }, 18000);

        // Refresh attendance list every 3 seconds
        attendanceInterval.current = setInterval(async () => {
            const attResult = await getSessionAttendance(sessionId);
            if (attResult.attendance) {
                setAttendance(attResult.attendance);
            }
        }, 3000);
    }

    function stopIntervals() {
        if (refreshInterval.current) clearInterval(refreshInterval.current);
        if (attendanceInterval.current) clearInterval(attendanceInterval.current);
    }

    useEffect(() => {
        if (qrToken) {
            generateQRImage(qrToken);
        }
    }, [qrToken]);

    async function generateQRImage(token: string) {
        const payload = JSON.stringify({
            token,
            ts: Date.now() // Timestamp to ensure uniqueness if needed client-side
        });
        const dataUrl = await QRCode.toDataURL(payload, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrDataUrl(dataUrl);
    }

    async function handleStartSession() {
        if (!selectedClassroomId) return;

        setActionLoading(true);
        setError(null);

        // Find subject_id for this classroom assignment
        const selectedClassroom = myClassrooms.find(c => c.classroom_id === selectedClassroomId);
        const subjectId = selectedClassroom?.subject_id;

        const result = await startAttendanceSession(selectedClassroomId, subjectId);

        if (result.error) {
            setError(result.error);
            setActionLoading(false);
            return;
        }

        setActiveSession(result.session);
        setQrToken(result.qrToken!);
        setExpiresAt(result.expiresAt!);

        startIntervals(result.session.id);

        // Load initial attendance (empty usually)
        setAttendance([]);
        setActionLoading(false);
    }

    async function handleEndSession() {
        if (!activeSession) return;

        stopIntervals();
        await endAttendanceSession(activeSession.id);

        setActiveSession(null);
        setQrToken(null);
        setQrDataUrl(null);
        setExpiresAt(null);
        setAttendance([]);
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <QrCode size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Classroom Attendance</h1>
                        <p className="text-gray-500 text-sm">Start a session for your assigned classrooms</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Controls */}
                    <div className="space-y-4">
                        {!activeSession ? (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <MapPin size={20} /> Select Classroom
                                </h3>

                                {myClassrooms.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>You are not assigned to any classrooms.</p>
                                        <p className="text-sm mt-2">Contact administrator.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            {myClassrooms.map((c) => (
                                                <button
                                                    key={c.classroom_id + '-' + (c.subject_id || 'nosub')}
                                                    onClick={() => setSelectedClassroomId(c.classroom_id)}
                                                    className={`w-full p-4 rounded-xl border text-left transition-all ${selectedClassroomId === c.classroom_id
                                                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold text-gray-800">
                                                                Room {c.room_number} <span className="font-normal text-gray-500">(Floor {c.floor_number})</span>
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                {c.building_name}
                                                            </div>
                                                        </div>
                                                        {c.subject_name && (
                                                            <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-medium">
                                                                <Book size={12} />
                                                                {c.subject_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleStartSession}
                                            disabled={actionLoading || !selectedClassroomId}
                                            className="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 transition-colors shadow-sm"
                                        >
                                            {actionLoading ? <Loader2 size={24} className="animate-spin" /> : <Play size={24} />}
                                            Start Session
                                        </button>
                                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Active Session Controls */}
                                <div className="bg-white border-2 border-green-500 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <RefreshCw size={100} className="animate-spin text-green-500" />
                                    </div>

                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 text-green-600 mb-1">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                <span className="font-bold tracking-wide uppercase text-sm">Session Active</span>
                                            </div>
                                            <h2 className="text-2xl font-bold">
                                                Room {myClassrooms.find(c => c.classroom_id === activeSession.classroom_id)?.room_number || '...'}
                                            </h2>
                                        </div>
                                        <button
                                            onClick={handleEndSession}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition-colors text-sm"
                                        >
                                            <Square size={16} />
                                            End
                                        </button>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3 mb-2">
                                        <RefreshCw size={18} className="text-green-600" />
                                        <p className="text-sm text-green-800 font-medium">QR code refreshes automatically every 20s</p>
                                    </div>
                                </div>

                                {/* Attendance List */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] flex flex-col">
                                    <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
                                        <Users size={20} />
                                        Present Students <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{attendance.length}</span>
                                    </h3>

                                    <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                                        {attendance.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                                <Users size={48} className="mb-2 opacity-20" />
                                                <p>Waiting for students...</p>
                                            </div>
                                        ) : (
                                            attendance.map((a) => (
                                                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                                                            {a.student_name ? a.student_name.charAt(0).toUpperCase() : '#'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{a.student_name || 'Student'}</p>
                                                            <p className="text-xs text-gray-500">{a.student_email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-mono text-gray-400">{new Date(a.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                            <MapPin size={8} /> {a.distance_m}m
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column - QR Code */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                        {qrDataUrl ? (
                            <>
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Scan to Mark Attendance</h3>
                                <div className="bg-white p-4 rounded-3xl shadow-xl border-8 border-gray-900 mb-8 transform transition-transform hover:scale-105 duration-300">
                                    <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 sm:w-80 sm:h-80 rendering-pixelated" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-gray-500">Code expires in <span className="font-mono font-bold text-red-500 w-6 inline-block text-left">--</span> seconds</p>
                                    <p className="text-xs text-gray-400">Ensure you are within the classroom range</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-400">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <QrCode size={40} className="opacity-20" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-2">Ready to Start</h3>
                                <p className="text-sm max-w-xs mx-auto">Select a classroom from the left and click Start Session to generate a secure QR code.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
