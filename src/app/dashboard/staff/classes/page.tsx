'use client';

import { useState, useEffect } from 'react';
import { createClass, getClasses, deleteClass, createSubject, getSubjects, deleteSubject } from '../../../../actions/classes';
import { Book, GraduationCap, Plus, Trash2, Loader2 } from 'lucide-react';

interface ClassItem {
    id: number;
    name: string;
    section: string;
    academic_year: string;
}

interface SubjectItem {
    id: number;
    name: string;
    code: string;
}

export default function StaffClassesPage() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

    // Form states
    const [className, setClassName] = useState('');
    const [classSection, setClassSection] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [classesResult, subjectsResult] = await Promise.all([
            getClasses(),
            getSubjects()
        ]);
        if (classesResult.classes) setClasses(classesResult.classes);
        if (subjectsResult.subjects) setSubjects(subjectsResult.subjects);
        setLoading(false);
    }

    async function handleCreateClass(e: React.FormEvent) {
        e.preventDefault();
        if (!className.trim()) return;

        setSubmitting(true);
        const result = await createClass(className, classSection);
        setSubmitting(false);

        if (result.success) {
            setClassName('');
            setClassSection('');
            loadData();
        } else {
            alert(result.error);
        }
    }

    async function handleCreateSubject(e: React.FormEvent) {
        e.preventDefault();
        if (!subjectName.trim()) return;

        setSubmitting(true);
        const result = await createSubject(subjectName, subjectCode);
        setSubmitting(false);

        if (result.success) {
            setSubjectName('');
            setSubjectCode('');
            loadData();
        } else {
            alert(result.error);
        }
    }

    async function handleDeleteClass(id: number) {
        if (!confirm('Delete this class? This will remove all related data.')) return;
        const result = await deleteClass(id);
        if (result.error) alert(result.error);
        else loadData();
    }

    async function handleDeleteSubject(id: number) {
        if (!confirm('Delete this subject?')) return;
        const result = await deleteSubject(id);
        if (result.error) alert(result.error);
        else loadData();
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Manage Classes & Subjects</h1>
                <p className="text-gray-500 mb-8">Create and manage academic classes and subjects</p>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === 'classes'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <GraduationCap size={18} /> Classes
                    </button>
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === 'subjects'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Book size={18} /> Subjects
                    </button>
                </div>

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <div className="space-y-6">
                        {/* Add Class Form */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4">Add New Class</h2>
                            <form onSubmit={handleCreateClass} className="flex flex-wrap gap-4">
                                <input
                                    type="text"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    placeholder="Class Name (e.g., 10A)"
                                    className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500"
                                />
                                <input
                                    type="text"
                                    value={classSection}
                                    onChange={(e) => setClassSection(e.target.value)}
                                    placeholder="Section (optional)"
                                    className="w-40 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Add Class
                                </button>
                            </form>
                        </div>

                        {/* Classes List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4">All Classes ({classes.length})</h2>
                            {classes.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No classes created yet</p>
                            ) : (
                                <div className="grid gap-3">
                                    {classes.map((cls) => (
                                        <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <span className="font-bold text-lg">{cls.name}</span>
                                                {cls.section && <span className="text-gray-500 ml-2">({cls.section})</span>}
                                                <span className="text-gray-400 text-sm ml-4">{cls.academic_year}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteClass(cls.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Subjects Tab */}
                {activeTab === 'subjects' && (
                    <div className="space-y-6">
                        {/* Add Subject Form */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4">Add New Subject</h2>
                            <form onSubmit={handleCreateSubject} className="flex flex-wrap gap-4">
                                <input
                                    type="text"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    placeholder="Subject Name (e.g., Mathematics)"
                                    className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500"
                                />
                                <input
                                    type="text"
                                    value={subjectCode}
                                    onChange={(e) => setSubjectCode(e.target.value)}
                                    placeholder="Code (e.g., MATH101)"
                                    className="w-40 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Add Subject
                                </button>
                            </form>
                        </div>

                        {/* Subjects List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4">All Subjects ({subjects.length})</h2>
                            {subjects.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No subjects created yet</p>
                            ) : (
                                <div className="grid gap-3">
                                    {subjects.map((subject) => (
                                        <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <span className="font-bold text-lg">{subject.name}</span>
                                                {subject.code && <span className="text-gray-500 ml-2 bg-gray-200 px-2 py-1 rounded text-sm">{subject.code}</span>}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSubject(subject.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
