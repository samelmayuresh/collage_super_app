'use client';

import { useState, useEffect } from 'react';
import { getSubjects } from '../../../../actions/classes';
import { getBuildings, getFloors, getClassrooms } from '../../../../actions/buildings';
import { assignTeacherToClassroom, getTeacherClassrooms, removeTeacherFromClassroom, getAllClassroomsWithDetails } from '../../../../actions/classroomAssignments';
import { Users, GraduationCap, Book, Plus, Trash2, Loader2, Building2, Layers, DoorOpen } from 'lucide-react';
import { getSession } from '../../../../actions/auth';

interface Assignment {
    id: number;
    teacher_id: number;
    classroom_id: number;
    subject_id?: number;
    subject_name?: string;
    room_number: string;
    floor_number: number;
    building_name: string;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface Building { id: number; name: string; }
interface Floor { id: number; floor_number: number; }
interface Classroom { id: number; room_number: string; }

export default function TeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]); // We need a way to fetch ALL assignments, not just for one teacher. 
    // Currently getTeacherClassrooms takes a teacherID. We might need a new action "getAllAssignments". 
    // For now, let's fetch individual teacher assignments when we load teachers. 
    // OR BETTER: Let's create an action to get ALL assignments.

    // Actually, let's just fetch all teachers and iterate.
    const [allAssignments, setAllAssignments] = useState<Record<number, Assignment[]>>({});

    const [buildings, setBuildings] = useState<Building[]>([]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedBuilding) {
            loadFloors(selectedBuilding);
            setSelectedFloor(null);
            setClassrooms([]);
            setSelectedClassroom('');
        }
    }, [selectedBuilding]);

    useEffect(() => {
        if (selectedFloor) {
            loadClassrooms(selectedFloor);
            setSelectedClassroom('');
        }
    }, [selectedFloor]);

    async function loadData() {
        setLoading(true);
        const [buildingsRes, subjectsRes] = await Promise.all([
            getBuildings(),
            getSubjects()
        ]);

        const teachersRes = await fetch('/api/teachers');
        const teachersData = await teachersRes.json();

        if (buildingsRes.buildings) setBuildings(buildingsRes.buildings);
        if (subjectsRes.subjects) setSubjects(subjectsRes.subjects);
        if (teachersData.teachers) {
            setTeachers(teachersData.teachers);
            // Load assignments for all teachers
            loadAllAssignments(teachersData.teachers);
        }

        setLoading(false);
    }

    async function loadAllAssignments(teachersList: Teacher[]) {
        const assignmentsMap: Record<number, Assignment[]> = {};

        await Promise.all(teachersList.map(async (t) => {
            const res = await getTeacherClassrooms(t.id);
            if (res.classrooms) {
                assignmentsMap[t.id] = res.classrooms;
            }
        }));

        setAllAssignments(assignmentsMap);
    }

    async function loadFloors(buildingId: number) {
        const result = await getFloors(buildingId);
        if (result.floors) setFloors(result.floors);
    }

    async function loadClassrooms(floorId: number) {
        const result = await getClassrooms(floorId);
        if (result.classrooms) setClassrooms(result.classrooms);
    }

    async function handleAssign(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedTeacher || !selectedClassroom) return;

        setSubmitting(true);
        const result = await assignTeacherToClassroom(
            parseInt(selectedTeacher),
            parseInt(selectedClassroom),
            selectedSubject ? parseInt(selectedSubject) : undefined
        );

        if (result.error) {
            alert(result.error);
        } else {
            // Refresh
            const res = await getTeacherClassrooms(parseInt(selectedTeacher));
            if (res.classrooms) {
                setAllAssignments(prev => ({
                    ...prev,
                    [parseInt(selectedTeacher)]: res.classrooms
                }));
            }
            setSelectedClassroom('');
            // Optional: reset others
        }
        setSubmitting(false);
    }

    async function handleRemove(assignmentId: number, teacherId: number) {
        if (!confirm('Remove this assignment?')) return;
        await removeTeacherFromClassroom(assignmentId);

        const res = await getTeacherClassrooms(teacherId);
        if (res.classrooms) {
            setAllAssignments(prev => ({
                ...prev,
                [teacherId]: res.classrooms
            }));
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
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Teacher Assignments</h1>
                <p className="text-gray-500 mb-8">Assign teachers to classrooms and subjects (Building &gt; Floor &gt; Classroom)</p>

                {/* Assign Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users size={20} /> New Assignment
                    </h2>
                    <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {/* Teacher */}
                        <div className="md:col-span-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Teacher</label>
                            <select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location Selectors */}
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Building</label>
                                <select
                                    value={selectedBuilding || ''}
                                    onChange={(e) => setSelectedBuilding(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Building</option>
                                    {buildings.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Floor</label>
                                <select
                                    value={selectedFloor || ''}
                                    onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
                                    disabled={!selectedBuilding}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                >
                                    <option value="">Floor</option>
                                    {floors.map((f) => (
                                        <option key={f.id} value={f.id}>{f.floor_number}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Classroom</label>
                                <select
                                    value={selectedClassroom}
                                    onChange={(e) => setSelectedClassroom(e.target.value)}
                                    disabled={!selectedFloor}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                >
                                    <option value="">Classroom</option>
                                    {classrooms.map((c) => (
                                        <option key={c.id} value={c.id}>{c.room_number}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="md:col-span-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Subject</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Subject (Optional)</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Submit */}
                        <div className="md:col-span-5 flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={submitting || !selectedTeacher || !selectedClassroom}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                Assign Teacher
                            </button>
                        </div>
                    </form>
                </div>

                {/* Assignments List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-lg mb-4">Current Assignments</h2>
                    {Object.keys(allAssignments).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No assignments created yet</p>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(allAssignments).map(([teacherId, teacherAssignments]) => {
                                if (teacherAssignments.length === 0) return null;
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
                                                <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 hover:bg-gray-50">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                                        <span className="flex items-center gap-2 text-sm font-medium">
                                                            <Building2 size={14} className="text-gray-400" />
                                                            {a.building_name}
                                                        </span>
                                                        <span className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Layers size={14} className="text-gray-400" />
                                                            Floor {a.floor_number}
                                                        </span>
                                                        <span className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                                                            <DoorOpen size={14} />
                                                            Room {a.room_number}
                                                        </span>
                                                        {a.subject_name && (
                                                            <span className="flex items-center gap-2 text-sm bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                                                <Book size={12} />
                                                                {a.subject_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(a.id, parseInt(teacherId))}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
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
