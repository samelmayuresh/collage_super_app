'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, BookOpen, User, Loader2, Plus, X, CheckCircle, GraduationCap } from 'lucide-react';
import { getAllStudents } from '../../../../actions/students';
import { getTeacherAssignments, addStudentToClass } from '../../../../actions/classes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Student {
    id: number;
    name: string;
    email: string;
    role: string;
    roll_number: string | null;
    class_name: string | null;
    class_id: number | null;
    created_at: string;
}

interface Assignment {
    id: number;
    teacher_id: number;
    class_id: number;
    subject_id: number;
    class_name: string;
    section: string;
    subject_name: string;
    subject_code: string;
}

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClassId, setFilterClassId] = useState<string>(''); // Default to first class maybe?

    // Enroll Modal
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [enrollModalOpen, setEnrollModalOpen] = useState(false);
    const [enrollClassId, setEnrollClassId] = useState('');
    const [enrollRollNo, setEnrollRollNo] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [studentsRes, assignmentsRes] = await Promise.all([
            getAllStudents(),
            getTeacherAssignments() // Fetches for current teacher
        ]);

        if (studentsRes.students) setStudents(studentsRes.students);
        if (assignmentsRes.assignments) {
            setAssignments(assignmentsRes.assignments);
            // Optional: Default filter to their first class? 
            // setFilterClassId(assignmentsRes.assignments[0]?.class_id.toString() || '');
        }
        setLoading(false);
    }

    // Unique classes from assignments (a teacher might have multiple subjects for same class)
    const myClasses = Array.from(new Map(assignments.map(item => [item.class_id, { id: item.class_id, name: item.class_name, section: item.section }])).values());

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesClass = true;
        if (filterClassId === 'ALL_MY') {
            // Show students in ANY of my classes
            matchesClass = myClasses.some(c => c.id === student.class_id);
        } else if (filterClassId && filterClassId !== 'GLOBAL') {
            // Show students in specific class
            matchesClass = student.class_id?.toString() === filterClassId;
        } else if (filterClassId === 'GLOBAL') {
            // Show all students (no class filter)
            matchesClass = true;
        } else {
            // Default: All My Classes
            matchesClass = myClasses.some(c => c.id === student.class_id);
        }

        // If searching, we might want to search GLOBAL automatically if no local match? 
        // For now, respect the filter.

        return matchesSearch && matchesClass;
    });

    async function handleEnroll() {
        if (!selectedStudent || !enrollClassId) return;

        setEnrolling(true);
        const result = await addStudentToClass(selectedStudent.id, parseInt(enrollClassId), enrollRollNo);

        if (result.success) {
            setEnrollModalOpen(false);
            loadData(); // Refresh list to see update
            // Reset fields
            setEnrollClassId('');
            setEnrollRollNo('');
        } else {
            alert('Failed to enroll student');
        }
        setEnrolling(false);
    }

    function openEnrollModal(student: Student) {
        setSelectedStudent(student);
        // Pre-fill if they are already in one of my classes?
        // If they are in NO class, clean state
        // If they are in A class that I teach, pre-select it?
        const currentClassId = student.class_id?.toString() || '';
        const isMyClass = myClasses.some(c => c.id.toString() === currentClassId);

        setEnrollClassId(isMyClass ? currentClassId : '');
        setEnrollRollNo(student.roll_number || '');
        setEnrollModalOpen(true);
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-96">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Students</h1>
                        <p className="text-gray-500">View and manage students in your classes</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search student by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                value={filterClassId}
                                onChange={(e) => setFilterClassId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white appearance-none"
                            >
                                <option value="">All My Classes</option>
                                <option value="GLOBAL">Show All Students (Global)</option>
                                <hr />
                                {myClasses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Student</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Class</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Roll No</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm w-10">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                                            <GraduationCap size={48} className="text-gray-300" />
                                            <p>No students found.</p>
                                            {filterClassId !== 'GLOBAL' && (
                                                <button
                                                    onClick={() => setFilterClassId('GLOBAL')}
                                                    className="text-indigo-600 hover:underline text-sm"
                                                >
                                                    Search in Global Directory
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => {
                                        const isEnrolledInMyClass = myClasses.some(c => c.id === student.class_id);

                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{student.name}</p>
                                                            <p className="text-sm text-gray-500">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {student.class_name ? (
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isEnrolledInMyClass ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {student.class_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-mono text-sm text-slate-600">
                                                    {student.roll_number || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => openEnrollModal(student)}
                                                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg text-sm font-medium whitespace-nowrap"
                                                    >
                                                        {student.class_name ? 'Edit Class' : 'Enroll'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Enroll Modal */}
            {enrollModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Enroll Student</h2>
                            <button onClick={() => setEnrollModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-4">Adding <span className="font-bold text-slate-800">{selectedStudent.name}</span> to your class.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Class</label>
                                    <select
                                        value={enrollClassId}
                                        onChange={(e) => setEnrollClassId(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">Select a class...</option>
                                        {myClasses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Only classes you are assigned to are shown.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Roll Number (Optional)</label>
                                    <input
                                        type="text"
                                        value={enrollRollNo}
                                        onChange={(e) => setEnrollRollNo(e.target.value)}
                                        placeholder="e.g. 101"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEnrollModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling || !enrollClassId}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {enrolling && <Loader2 size={16} className="animate-spin" />}
                                Enroll Student
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
