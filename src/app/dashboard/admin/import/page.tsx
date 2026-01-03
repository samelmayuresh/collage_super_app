'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X, Building2 } from 'lucide-react';
import { getAllClassroomsWithDetails } from '../../../../actions/classroomAssignments';
import Link from 'next/link';

interface StudentRow {
    name: string;
    email: string;
    rollNumber: string;
    status: 'pending' | 'success' | 'error' | 'duplicate';
    message?: string;
}

interface Classroom {
    id: number;
    room_number: string;
    floor_number: number;
    building_name: string;
}

export default function BulkImportPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState('');
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const result = await getAllClassroomsWithDetails();
        if (result.classrooms) setClassrooms(result.classrooms);
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target?.result as string;
            parseCSV(text);
            setLoading(false);
            setStep('preview');
        };

        reader.onerror = () => {
            alert('Error reading file');
            setLoading(false);
        };

        reader.readAsText(file);
    }

    function parseCSV(text: string) {
        const lines = text.split('\n').filter(line => line.trim());
        const parsedStudents: StudentRow[] = [];
        const seenEmails = new Set<string>();

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(col => col.trim().replace(/^"|"$/g, ''));

            if (cols.length >= 2) {
                const name = cols[0]?.trim();
                const email = cols[1]?.trim().toLowerCase();
                const rollNumber = cols[2]?.trim() || '';

                if (!name || !email) continue;

                // Check for duplicates
                if (seenEmails.has(email)) {
                    parsedStudents.push({
                        name,
                        email,
                        rollNumber,
                        status: 'duplicate',
                        message: 'Duplicate email in file'
                    });
                } else {
                    seenEmails.add(email);
                    parsedStudents.push({
                        name,
                        email,
                        rollNumber,
                        status: 'pending'
                    });
                }
            }
        }

        setStudents(parsedStudents);
    }

    async function handleImport() {
        if (!selectedClassroomId) {
            alert('Please select a classroom');
            return;
        }

        setImporting(true);

        // Create student accounts via API
        const createPromises = students
            .filter(s => s.status === 'pending')
            .map(async (student) => {
                try {
                    const createRes = await fetch('/api/students/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: student.name,
                            email: student.email,
                            password: 'student123', // Default password
                            classroomId: parseInt(selectedClassroomId),
                            rollNumber: student.rollNumber // Sent but likely ignored by backend
                        })
                    });

                    const result = await createRes.json();

                    setStudents(prev => {
                        const updated = [...prev];
                        const idx = prev.findIndex(s => s.email === student.email && s.status === 'pending');
                        if (idx !== -1) {
                            updated[idx] = {
                                ...updated[idx],
                                status: result.error ? 'error' : 'success',
                                message: result.error || 'Added successfully'
                            };
                        }
                        return updated;
                    });
                } catch (error) {
                    setStudents(prev => {
                        const updated = [...prev];
                        const idx = prev.findIndex(s => s.email === student.email);
                        if (idx !== -1) {
                            updated[idx] = {
                                ...updated[idx],
                                status: 'error',
                                message: 'Failed to add'
                            };
                        }
                        return updated;
                    });
                }
            });

        await Promise.all(createPromises);
        setImporting(false);
        setStep('complete');
    }

    function reset() {
        setStudents([]);
        setSelectedClassroomId('');
        setStep('upload');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const pendingCount = students.filter(s => s.status === 'pending').length;
    const successCount = students.filter(s => s.status === 'success').length;
    const errorCount = students.filter(s => s.status === 'error').length;
    const duplicateCount = students.filter(s => s.status === 'duplicate').length;

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Bulk Student Import</h1>
                <p className="text-gray-500 mb-8 max-w-2xl">
                    Import students from a CSV file and enroll them directly into a Classroom.
                    Students will be able to mark attendance for the selected room.
                </p>

                {/* Steps */}
                <div className="flex gap-4 mb-8">
                    {['upload', 'preview', 'complete'].map((s, i) => (
                        <div key={s} className={`flex-1 h-2 rounded-full ${step === s || (step === 'complete' && i < 2) || (step === 'preview' && i === 0) ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    ))}
                </div>

                {step === 'upload' && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="text-center mb-8">
                            <FileSpreadsheet size={48} className="mx-auto text-blue-500 mb-4" />
                            <h2 className="font-bold text-xl mb-2">Upload CSV File</h2>
                            <p className="text-gray-500">File should have columns: Name, Email, Roll Number</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Select Classroom *</label>
                            <select
                                value={selectedClassroomId}
                                onChange={(e) => setSelectedClassroomId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 bg-white"
                            >
                                <option value="">Choose a classroom...</option>
                                {classrooms.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.building_name} - Room {c.room_number} (Floor {c.floor_number})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <Building2 size={12} />
                                Students will be assigned to this physical location.
                            </p>
                        </div>

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            {loading ? (
                                <Loader2 size={32} className="mx-auto animate-spin text-blue-500" />
                            ) : (
                                <>
                                    <Upload size={32} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-gray-400 text-sm">CSV files only</p>
                                </>
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <p className="font-medium text-sm mb-2">📋 CSV Format Example:</p>
                            <code className="text-xs text-gray-600 block">
                                Name,Email,Roll Number<br />
                                John Doe,john@example.com,001<br />
                                Jane Smith,jane@example.com,002
                            </code>
                        </div>
                    </div>
                )}

                {step === 'preview' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg">Preview ({students.length} students)</h2>
                                <div className="flex gap-2">
                                    {duplicateCount > 0 && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                            {duplicateCount} duplicates
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                        {pendingCount} ready
                                    </span>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="text-left p-3">Name</th>
                                            <th className="text-left p-3">Email</th>
                                            <th className="text-left p-3">Roll No</th>
                                            <th className="text-left p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="p-3">{s.name}</td>
                                                <td className="p-3 text-gray-500">{s.email}</td>
                                                <td className="p-3">{s.rollNumber}</td>
                                                <td className="p-3">
                                                    {s.status === 'pending' && <span className="text-blue-500">Ready</span>}
                                                    {s.status === 'duplicate' && <span className="text-yellow-500">Duplicate</span>}
                                                    {s.status === 'success' && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={14} /> Added</span>}
                                                    {s.status === 'error' && <span className="text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {s.message}</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={reset}
                                className="px-6 py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing || pendingCount === 0}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                Import {pendingCount} Students
                            </button>
                        </div>
                    </div>
                )}

                {step === 'complete' && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                        <h2 className="font-bold text-2xl mb-2">Import Complete!</h2>
                        <p className="text-gray-500 mb-6">
                            {successCount} students added successfully
                            {errorCount > 0 && `, ${errorCount} failed`}
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={reset}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                            >
                                Import More
                            </button>
                            <Link
                                href="/dashboard/admin/students"
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                            >
                                View Students
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
