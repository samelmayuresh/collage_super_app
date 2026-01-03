'use client';

import { useState, useEffect } from 'react';
import { getClasses, getSubjects, assignTeacherToClass, getAllTeacherAssignments, removeTeacherAssignment } from '../../../../actions/classes';
import { Users, GraduationCap, Book, Plus, Trash2, Loader2 } from 'lucide-react';

interface Assignment {
    id: number;
    teacher_id: number;
    class_id: number;
    subject_id: number;
    class_name: string;
    section: string;
    subject_name: string;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
}

export default function TeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [classesRes, subjectsRes, assignmentsRes] = await Promise.all([
            getClasses(),
            getSubjects(),
            getAllTeacherAssignments()
        ]);

        // Fetch teachers from API
        const teachersRes = await fetch('/api/teachers');
        const teachersData = await teachersRes.json();

        if (classesRes.classes) setClasses(classesRes.classes);
        if (subjectsRes.subjects) setSubjects(subjectsRes.subjects);
        if (assignmentsRes.assignments) setAssignments(assignmentsRes.assignments);
        if (teachersData.teachers) setTeachers(teachersData.teachers);

        setLoading(false);
    }

    async function handleAssign(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedTeacher || !selectedClass || !selectedSubject) return;

        setSubmitting(true);
        await assignTeacherToClass(
            parseInt(selectedTeacher),
            parseInt(selectedClass),
            parseInt(selectedSubject)
        );
        setSubmitting(false);
        setSelectedTeacher('');
        setSelectedClass('');
        setSelectedSubject('');
        loadData();
    }

    async function handleRemove(assignmentId: number) {
        if (!confirm('Remove this assignment?')) return;
        await removeTeacherAssignment(assignmentId);
        loadData();
    }

    // Group assignments by teacher
    const groupedAssignments = assignments.reduce((acc, a) => {
        const teacherId = a.teacher_id;
        if (!acc[teacherId]) acc[teacherId] = [];
        acc[teacherId].push(a);
        return acc;
    }, {} as Record<number, Assignment[]>);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Teacher Assignments</h1>
                <p className="text-gray-500 mb-8">Assign teachers to classes and subjects</p>

                {/* Assign Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users size={20} /> New Assignment
                    </h2>
                    <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <select
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select Class</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>
                            ))}
                        </select>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={submitting || !selectedTeacher || !selectedClass || !selectedSubject}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Assign
                        </button>
                    </form>
                </div>

                {/* Assignments List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-lg mb-4">Current Assignments</h2>
                    {Object.keys(groupedAssignments).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No assignments created yet</p>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedAssignments).map(([teacherId, teacherAssignments]) => {
                                const teacher = teachers.find(t => t.id === parseInt(teacherId));
                                return (
                                    <div key={teacherId} className="border border-gray-100 rounded-xl p-4">
                                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                {teacher?.name?.charAt(0) || 'T'}
                                            </div>
                                            {teacher?.name || `Teacher #${teacherId}`}
                                        </h3>
                                        <div className="grid gap-2">
                                            {teacherAssignments.map((a) => (
                                                <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1 text-sm">
                                                            <GraduationCap size={14} className="text-green-500" />
                                                            {a.class_name} {a.section || ''}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-sm">
                                                            <Book size={14} className="text-purple-500" />
                                                            {a.subject_name}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(a.id)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
