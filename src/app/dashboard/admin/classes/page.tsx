'use client';

import { useState, useEffect } from 'react';
import { getClasses, deleteClass, getSubjects, deleteSubject } from '../../../../actions/classes';
import { Book, GraduationCap, Trash2, Loader2, AlertCircle } from 'lucide-react';

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

export default function ClassesManagementPage() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

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

    async function handleDeleteClass(id: number) {
        if (!confirm('Delete this class? This will remove all related data.')) return;
        await deleteClass(id);
        loadData();
    }

    async function handleDeleteSubject(id: number) {
        if (!confirm('Delete this subject?')) return;
        await deleteSubject(id);
        loadData();
    }

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
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">Classes & Subjects</h1>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mb-8 text-blue-800">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Read Only Admin View</p>
                        <p className="text-sm opacity-90 mt-1">
                            Use the <span className="font-bold">Staff Panel</span> to create new Classes or Subjects.
                            Admins are responsible for assigning Teachers and Students to these existing classes.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === 'classes'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <GraduationCap size={18} /> Classes
                    </button>
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === 'subjects'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Book size={18} /> Subjects
                    </button>
                </div>

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <div className="space-y-6">
                        {/* Classes List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4">All Classes ({classes.length})</h2>
                            {classes.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No classes found</p>
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
                        {/* Subjects List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4">All Subjects ({subjects.length})</h2>
                            {subjects.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No subjects found</p>
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
