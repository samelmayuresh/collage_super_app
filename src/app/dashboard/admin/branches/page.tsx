'use client';

import { useState, useEffect } from 'react';
import { createBranch, getBranches, deleteBranch, assignTeacherToBranch, getAllTeachersWithBranches } from '../../../../actions/branches';
import { getUsersByRole } from '../../../../actions/auth';
import { GitBranch, Plus, Trash2, Users, Loader2, Save } from 'lucide-react';

interface Branch { id: number; name: string; code: string; }
interface Teacher { id: number; name: string; email: string; }
interface BranchMapping { teacher_id: number; branch_id: number; }

export default function AdminBranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [mappings, setMappings] = useState<Record<number, number>>({}); // teacherId -> branchId
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'branches' | 'staff'>('branches');

    // Create Branch Form
    const [newBranchName, setNewBranchName] = useState('');
    const [newBranchCode, setNewBranchCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [branchesRes, teachersRes, mappingsRes] = await Promise.all([
            getBranches(),
            getUsersByRole('TEACHING'),
            getAllTeachersWithBranches()
        ]);

        if (branchesRes.branches) setBranches(branchesRes.branches);
        if (teachersRes.users) setTeachers(teachersRes.users);

        if (mappingsRes.mappings) {
            const map: Record<number, number> = {};
            mappingsRes.mappings.forEach((m: BranchMapping) => {
                map[m.teacher_id] = m.branch_id;
            });
            setMappings(map);
        }

        setLoading(false);
    }

    async function handleCreateBranch(e: React.FormEvent) {
        e.preventDefault();
        if (!newBranchName) return;

        setSubmitting(true);
        const result = await createBranch(newBranchName, newBranchCode);
        if (result.success) {
            setNewBranchName('');
            setNewBranchCode('');
            loadData();
        } else {
            alert('Failed to create branch');
        }
        setSubmitting(false);
    }

    async function handleDeleteBranch(id: number) {
        if (!confirm('Are you sure? This will unassign all teachers from this branch.')) return;
        await deleteBranch(id);
        loadData();
    }

    async function handleAssignTeacher(teacherId: number, branchId: number) {
        // Optimistic update
        setMappings(prev => ({ ...prev, [teacherId]: branchId }));

        const result = await assignTeacherToBranch(teacherId, branchId);
        if (!result.success) {
            alert('Failed to update assignment');
            loadData(); // Revert
        }
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
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                        <GitBranch size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Branches & Departments</h1>
                        <p className="text-gray-500 text-sm">Manage teaching branches and staff assignments</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('branches')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'branches'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Manage Branches
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'staff'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Assign Staff
                    </button>
                </div>

                {activeTab === 'branches' ? (
                    <div className="space-y-6">
                        {/* Create Form */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Plus size={20} /> Add New Branch
                            </h2>
                            <form onSubmit={handleCreateBranch} className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Branch Name (e.g. Computer Science)"
                                    value={newBranchName}
                                    onChange={(e) => setNewBranchName(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Code (e.g. CS) - Optional"
                                    value={newBranchCode}
                                    onChange={(e) => setNewBranchCode(e.target.value)}
                                    className="w-full sm:w-48 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !newBranchName}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Create'}
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-700">Existing Branches ({branches.length})</h2>
                            </div>
                            {branches.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No branches added yet.</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {branches.map((b) => (
                                        <div key={b.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{b.name}</h3>
                                                {b.code && <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">{b.code}</span>}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteBranch(b.id)}
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
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-700">Assign Teachers to Branches</h2>
                            <span className="text-sm text-gray-500">{teachers.length} Teachers</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {teachers.map((teacher) => (
                                <div key={teacher.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {teacher.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{teacher.name}</div>
                                            <div className="text-xs text-gray-500">{teacher.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <select
                                            value={mappings[teacher.id] || ''}
                                            onChange={(e) => handleAssignTeacher(teacher.id, parseInt(e.target.value))}
                                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 min-w-[200px]"
                                        >
                                            <option value="">No Branch Assigned</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                            {teachers.length === 0 && (
                                <div className="p-8 text-center text-gray-500">No teachers found.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
