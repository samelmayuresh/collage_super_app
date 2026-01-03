'use client';

import { useState, useEffect, useRef } from 'react';
import { getBuildings, getFloors, getClassrooms } from '../../../../actions/buildings';
import { startAttendanceSession, refreshQRToken, endAttendanceSession, getActiveSession, getMyActiveSession, getSessionAttendance } from '../../../../actions/attendance';
import { getTeacherAssignments } from '../../../../actions/classes';
import { QrCode, Play, Square, Building2, Layers, DoorOpen, Users, RefreshCw, Loader2, CheckCircle, GraduationCap, Book } from 'lucide-react';
import QRCode from 'qrcode';

interface Building { id: number; name: string; }
interface Floor { id: number; floor_number: number; }
interface Classroom { id: number; room_number: string; }
interface AttendanceRecord {
    id: number;
    student_id: number;
    student_name?: string;
    student_email?: string;
    distance_m: number;
    marked_at: string;
}
interface Assignment {
    id: number;
    class_id: number;
    subject_id: number;
    class_name: string;
    section: string;
    subject_name: string;
}

export default function TeacherAttendancePage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);

    // Class/Subject selection
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAcademicClass, setSelectedAcademicClass] = useState<number | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

    const [activeSession, setActiveSession] = useState<any>(null);
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);
    const attendanceInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadBuildings();
        loadAssignments();
        checkActiveSession();
        return () => {
            if (refreshInterval.current) clearInterval(refreshInterval.current);
            if (attendanceInterval.current) clearInterval(attendanceInterval.current);
        };
    }, []);

    async function loadAssignments() {
        const result = await getTeacherAssignments();
        if (result.assignments) setAssignments(result.assignments);
    }

    async function checkActiveSession() {
        const result = await getMyActiveSession();
        if (result.session) {
            // Restore session state
            const session = result.session;
            setActiveSession(session);
            setQrToken(session.qr_token);
            setExpiresAt(session.expires_at);

            // Fetch live attendance immediately
            const attResult = await getSessionAttendance(session.id);
            if (attResult.attendance) setAttendance(attResult.attendance);

            // Restart intervals
            startIntervals(session.id);
        }
    }

    function startIntervals(sessionId: number) {
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

    useEffect(() => {
        if (selectedBuilding) {
            loadFloors(selectedBuilding);
            setSelectedFloor(null);
            setSelectedClassroom(null);
        }
    }, [selectedBuilding]);

    useEffect(() => {
        if (selectedFloor) {
            loadClassrooms(selectedFloor);
            setSelectedClassroom(null);
        }
    }, [selectedFloor]);

    useEffect(() => {
        if (qrToken) {
            generateQRImage(qrToken);
        }
    }, [qrToken]);

    async function loadBuildings() {
        const result = await getBuildings();
        if (result.buildings) setBuildings(result.buildings);
    }

    async function loadFloors(buildingId: number) {
        const result = await getFloors(buildingId);
        if (result.floors) setFloors(result.floors);
    }

    async function loadClassrooms(floorId: number) {
        const result = await getClassrooms(floorId);
        if (result.classrooms) setClassrooms(result.classrooms);
    }

    async function generateQRImage(token: string) {
        const payload = JSON.stringify({
            token,
            ts: Date.now()
        });
        const dataUrl = await QRCode.toDataURL(payload, {
            width: 280,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrDataUrl(dataUrl);
    }

    async function handleStartSession() {
        if (!selectedAcademicClass) {
            setError('Please select a class (e.g. FYIT-A)');
            return;
        }
        if (!selectedClassroom) {
            setError('Please select a classroom');
            return;
        }

        setLoading(true);
        setError(null);
        const result = await startAttendanceSession(selectedClassroom, selectedAcademicClass || undefined, selectedSubject || undefined);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        setActiveSession(result.session);
        setQrToken(result.qrToken!);
        setExpiresAt(result.expiresAt!);
        setLoading(false);

        // Start auto-refresh every 18 seconds (before the 20s expiry)
        refreshInterval.current = setInterval(async () => {
            const refreshResult = await refreshQRToken(result.session.id);
            if (refreshResult.qrToken) {
                setQrToken(refreshResult.qrToken);
                setExpiresAt(refreshResult.expiresAt!);
            }
        }, 18000);

        // Refresh attendance list every 3 seconds
        attendanceInterval.current = setInterval(async () => {
            const attResult = await getSessionAttendance(result.session.id);
            if (attResult.attendance) {
                setAttendance(attResult.attendance);
            }
        }, 3000);

        // Load initial attendance
        const attResult = await getSessionAttendance(result.session.id);
        if (attResult.attendance) setAttendance(attResult.attendance);
    }

    async function handleEndSession() {
        if (!activeSession) return;

        if (refreshInterval.current) clearInterval(refreshInterval.current);
        if (attendanceInterval.current) clearInterval(attendanceInterval.current);

        await endAttendanceSession(activeSession.id);
        setActiveSession(null);
        setQrToken(null);
        setQrDataUrl(null);
        setExpiresAt(null);
    }

    return (
        <div className="flex-1 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <QrCode size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Attendance</h1>
                        <p className="text-gray-500 text-sm">Start a session and show QR code to students</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Controls */}
                    <div className="space-y-4">
                        {!activeSession ? (
                            <>
                                {/* Class & Subject Selector */}
                                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-bold mb-4">Select Class & Subject</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                                                <GraduationCap size={14} /> Class
                                            </label>
                                            <select
                                                value={selectedAcademicClass || ''}
                                                onChange={(e) => {
                                                    setSelectedAcademicClass(parseInt(e.target.value));
                                                    setSelectedSubject(null);
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Choose class...</option>
                                                {Array.from(new Set(assignments.map(a => a.class_id))).map(classId => {
                                                    const cls = assignments.find(a => a.class_id === classId);
                                                    return (
                                                        <option key={classId} value={classId}>
                                                            {cls?.class_name} {cls?.section || ''}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                                                <Book size={14} /> Subject
                                            </label>
                                            <select
                                                value={selectedSubject || ''}
                                                onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
                                                disabled={!selectedAcademicClass}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="">Choose subject...</option>
                                                {assignments
                                                    .filter(a => a.class_id === selectedAcademicClass)
                                                    .map(a => (
                                                        <option key={a.subject_id} value={a.subject_id}>
                                                            {a.subject_name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    {assignments.length === 0 && (
                                        <p className="text-amber-600 text-sm mt-3">⚠️ No class assignments found. Contact admin to assign classes.</p>
                                    )}
                                </div>

                                {/* Classroom Selector */}
                                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-bold mb-4">Select Classroom</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                                                <Building2 size={14} /> Building
                                            </label>
                                            <select
                                                value={selectedBuilding || ''}
                                                onChange={(e) => setSelectedBuilding(parseInt(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Choose building...</option>
                                                {buildings.map((b) => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                                                <Layers size={14} /> Floor
                                            </label>
                                            <select
                                                value={selectedFloor || ''}
                                                onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
                                                disabled={!selectedBuilding}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="">Choose floor...</option>
                                                {floors.map((f) => (
                                                    <option key={f.id} value={f.id}>Floor {f.floor_number}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                                                <DoorOpen size={14} /> Classroom
                                            </label>
                                            <select
                                                value={selectedClassroom || ''}
                                                onChange={(e) => setSelectedClassroom(parseInt(e.target.value))}
                                                disabled={!selectedFloor}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="">Choose classroom...</option>
                                                {classrooms.map((c) => (
                                                    <option key={c.id} value={c.id}>Room {c.room_number}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleStartSession}
                                    disabled={loading || !selectedClassroom || !selectedAcademicClass}
                                    className="w-full px-6 py-4 bg-green-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Play size={24} />}
                                    Start Attendance Session
                                </button>
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            </>
                        ) : (
                            <>
                                {/* Active Session Controls */}
                                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                            <span className="font-bold">Session Active</span>
                                        </div>
                                        <div className="text-xs text-green-600 flex items-center gap-1">
                                            <RefreshCw size={12} className="animate-spin" />
                                            QR refreshes every 20s
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleEndSession}
                                        className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600"
                                    >
                                        <Square size={20} />
                                        End Session
                                    </button>
                                </div>

                                {/* Attendance List */}
                                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <Users size={20} />
                                        Present Students ({attendance.length})
                                    </h3>
                                    {attendance.length === 0 ? (
                                        <p className="text-gray-400 text-center py-4">Waiting for students to scan...</p>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {attendance.map((a) => (
                                                <div key={a.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-sm">
                                                            {a.student_name ? a.student_name.charAt(0).toUpperCase() : '#'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{a.student_name || `Student #${a.student_id}`}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{a.distance_m}m away</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column - QR Code */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                        {qrDataUrl ? (
                            <>
                                <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-black mb-4">
                                    <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
                                </div>
                                <p className="text-sm text-gray-500 text-center">
                                    Show this QR code to students.<br />
                                    It refreshes automatically every 20 seconds.
                                </p>
                            </>
                        ) : (
                            <div className="text-center text-gray-400">
                                <QrCode size={80} className="mx-auto mb-4 opacity-20" />
                                <p>Start a session to generate QR code</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
