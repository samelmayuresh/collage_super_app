'use client';

import { useState, useEffect } from 'react';
import { createClass, getClasses, deleteClass } from '../../../../actions/classes';
import { GraduationCap, Plus, Trash2, Loader2 } from 'lucide-react';

interface ClassItem {
    id: number;
    name: string;
    section: string;
    academic_year: string;
}

export default function StaffClassesPage() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [className, setClassName] = useState('');
    const [classSection, setClassSection] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const result = await getClasses();
        if (result.classes) setClasses(result.classes);
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

    async function handleDeleteClass(id: number) {
        if (!confirm('Delete this class? This will remove all related data.')) return;
        const result = await deleteClass(id);
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
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Manage Classes</h1>
                <p className="text-gray-500 mb-8">Create and manage academic classes</p>

                {/* Add Class Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <GraduationCap size={20} /> Add New Class
                    </h2>
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
        </div>
    );
}
