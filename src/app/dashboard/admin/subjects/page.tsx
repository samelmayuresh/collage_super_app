'use client';

import { useState, useEffect } from 'react';
import { createSubject, getSubjects, deleteSubject } from '../../../../actions/classes';
import { BookOpen, Plus, Trash2, Loader2, Search } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code: string | null;
}

export default function AdminSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const result = await getSubjects();
        if (result.subjects) setSubjects(result.subjects);
        setLoading(false);
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

    async function handleDeleteSubject(id: number) {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        const result = await deleteSubject(id);
        if (result.error) alert(result.error);
        else loadData();
    }

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800">Manage Subjects</h1>
                <p className="text-gray-500 mb-8">Create and manage academic subjects</p>

                {/* Add Subject Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-indigo-600" />
                        Add New Subject
                    </h2>
                    <form onSubmit={handleCreateSubject} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 w-full sm:w-auto">
                            <input
                                type="text"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                                placeholder="Subject Name (e.g. Mathematics)"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <input
                                type="text"
                                value={subjectCode}
                                onChange={(e) => setSubjectCode(e.target.value)}
                                placeholder="Code (e.g. MATH101)"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !subjectName.trim()}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 min-w-[140px]"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Add Subject
                        </button>
                    </form>
                </div>

                {/* Subjects List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-lg">All Subjects ({subjects.length})</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search subjects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {filteredSubjects.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No subjects found</p>
                    ) : (
                        <div className="grid gap-3">
                            {filteredSubjects.map((subject) => (
                                <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-bold border border-gray-100 shadow-sm">
                                            {subject.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-800 block">{subject.name}</span>
                                            {subject.code && (
                                                <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                                    {subject.code}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSubject(subject.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Delete Subject"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
