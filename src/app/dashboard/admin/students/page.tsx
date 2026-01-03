'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, User, Loader2, Plus, X, CheckCircle } from 'lucide-react';
import { getAllStudents } from '../../../../actions/students';
import { getClasses, addStudentToClass } from '../../../../actions/classes';
import Link from 'next/link';

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

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [classes, setClasses] = useState<any[]>([]);

    // Class Assignment State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignClassId, setAssignClassId] = useState('');
    const [assignRollNo, setAssignRollNo] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [studentsRes, classesRes] = await Promise.all([
            getAllStudents(),
            getClasses()
        ]);

        if (studentsRes.students) setStudents(studentsRes.students);
        if (classesRes.classes) setClasses(classesRes.classes);
        if (classesRes.classes) setClasses(classesRes.classes);
        setLoading(false);
    }

    async function handleAssignClass() {
        if (!selectedStudent || !assignClassId) return;

        setAssigning(true);
        const result = await addStudentToClass(selectedStudent.id, parseInt(assignClassId), assignRollNo);

        if (result.success) {
            setAssignModalOpen(false);
            loadData(); // Refresh list
        } else {
            alert('Failed to assign class');
        }
        setAssigning(false);
    }

    function openAssignModal(student: Student) {
        setSelectedStudent(student);
        setAssignClassId(student.class_id?.toString() || '');
        setAssignRollNo(student.roll_number || '');
        setAssignModalOpen(true);
    }

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass ? student.class_name === filterClass : true;
        return matchesSearch && matchesClass;
    });

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
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Students</h1>
                        <p className="text-gray-500">Manage all student accounts and enrollments</p>
                    </div>
                    <Link
                        href="/dashboard/admin/import"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Bulk Import
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or roll no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.name}>{c.name} {c.section}</option>
                            ))}
                        </select>
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
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Joined</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No students found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
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
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
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
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(student.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => openAssignModal(student)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg text-sm font-medium whitespace-nowrap"
                                                >
                                                    {student.class_name ? 'Change Class' : 'Assign Class'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Assign Class Modal */}
            {assignModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Assign Class</h2>
                            <button onClick={() => setAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-4">Assigning <span className="font-bold text-slate-800">{selectedStudent.name}</span> to a class.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Class</label>
                                    <select
                                        value={assignClassId}
                                        onChange={(e) => setAssignClassId(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">Select Class...</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Roll Number (Optional)</label>
                                    <input
                                        type="text"
                                        value={assignRollNo}
                                        onChange={(e) => setAssignRollNo(e.target.value)}
                                        placeholder="e.g. 101"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setAssignModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignClass}
                                disabled={assigning || !assignClassId}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {assigning && <Loader2 size={16} className="animate-spin" />}
                                Save Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
