'use client';

import { useState, useEffect } from 'react';
import { getBuildings, getFloors, getClassrooms } from '../../../../actions/buildings';
import { getSubjects } from '../../../../actions/classes';
import { assignTeacherToClassroom, getTeacherClassrooms, removeTeacherFromClassroom, getStudentsByClassroom, addStudentToClassroom, removeStudentFromClassroom, getAllClassroomsWithDetails, getTeachersByClassroom } from '../../../../actions/classroomAssignments';
import { getUsersByRole } from '../../../../actions/auth';
import { DoorOpen, Loader2, Layers, Building2, Users, UserPlus, Trash2, Book, GraduationCap } from 'lucide-react';

interface Building { id: number; name: string; }
interface Floor { id: number; floor_number: number; }
interface Classroom { id: number; room_number: string; floor_id: number; floor_number?: number; building_name?: string; }
interface Subject { id: number; name: string; code: string; }
interface Teacher { id: number; name: string; email: string; }
interface Student { id: number; name: string; email: string; student_id?: number; }
interface Assignment { id: number; teacher_id: number; classroom_id: number; subject_id?: number; subject_name?: string; teacher_name?: string; teacher_email?: string; }

export default function AdminClassroomsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
    const [classroomStudents, setClassroomStudents] = useState<Student[]>([]);
    const [classroomTeachers, setClassroomTeachers] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'view' | 'assign'>('view');

    // Assignment form
    const [assignTeacherId, setAssignTeacherId] = useState<number | null>(null);
    const [assignSubjectId, setAssignSubjectId] = useState<number | null>(null);
    const [assignStudentId, setAssignStudentId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedBuilding) {
            loadFloors(selectedBuilding);
            setSelectedFloor(null);
            setClassrooms([]);
            setSelectedClassroom(null);
        }
    }, [selectedBuilding]);

    useEffect(() => {
        if (selectedFloor) {
            loadClassrooms(selectedFloor);
            setSelectedClassroom(null);
        }
    }, [selectedFloor]);

    useEffect(() => {
        if (selectedClassroom) {
            loadClassroomDetails(selectedClassroom);
        }
    }, [selectedClassroom]);

    async function loadInitialData() {
        setLoading(true);
        const [buildingsRes, subjectsRes, teachersRes, studentsRes, allClassroomsRes] = await Promise.all([
            getBuildings(),
            getSubjects(),
            getUsersByRole('TEACHING'),
            getUsersByRole('STUDENT'),
            getAllClassroomsWithDetails()
        ]);
        if (buildingsRes.buildings) setBuildings(buildingsRes.buildings);
        if (subjectsRes.subjects) setSubjects(subjectsRes.subjects);
        if (teachersRes.users) setTeachers(teachersRes.users);
        if (studentsRes.users) setStudents(studentsRes.users);
        if (allClassroomsRes.classrooms) setAllClassrooms(allClassroomsRes.classrooms);
        setLoading(false);
    }

    async function loadFloors(buildingId: number) {
        const result = await getFloors(buildingId);
        if (result.floors) setFloors(result.floors);
    }

    async function loadClassrooms(floorId: number) {
        const result = await getClassrooms(floorId);
        if (result.classrooms) setClassrooms(result.classrooms);
    }

    async function loadClassroomDetails(classroomId: number) {
        const [studentsRes, teachersRes] = await Promise.all([
            getStudentsByClassroom(classroomId),
            getTeachersByClassroom(classroomId)
        ]);

        if (studentsRes.students) setClassroomStudents(studentsRes.students);
        if (teachersRes.teachers) setClassroomTeachers(teachersRes.teachers);
    }

    async function handleAssignTeacher() {
        if (!selectedClassroom || !assignTeacherId) return;
        setSubmitting(true);
        const result = await assignTeacherToClassroom(assignTeacherId, selectedClassroom, assignSubjectId || undefined);
        if (result.error) alert(result.error);
        else {
            setAssignTeacherId(null);
            setAssignSubjectId(null);
            loadClassroomDetails(selectedClassroom);
        }
        setSubmitting(false);
    }

    async function handleRemoveTeacher(assignmentId: number) {
        if (!confirm('Remove this teacher from this classroom?')) return;
        await removeTeacherFromClassroom(assignmentId);
        if (selectedClassroom) loadClassroomDetails(selectedClassroom);
    }

    async function handleAddStudent() {
        if (!selectedClassroom || !assignStudentId) return;
        setSubmitting(true);
        const result = await addStudentToClassroom(assignStudentId, selectedClassroom);
        if (result.error) alert(result.error);
        else {
            setAssignStudentId(null);
            loadClassroomDetails(selectedClassroom);
        }
        setSubmitting(false);
    }

    async function handleRemoveStudent(studentId: number) {
        if (!selectedClassroom || !confirm('Remove this student from classroom?')) return;
        await removeStudentFromClassroom(studentId, selectedClassroom);
        loadClassroomDetails(selectedClassroom);
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
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                        <DoorOpen size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Classroom Management</h1>
                        <p className="text-gray-500 text-sm">View classrooms and manage assignments</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('view')}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === 'view' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                        View Classrooms
                    </button>
                    <button
                        onClick={() => setActiveTab('assign')}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === 'assign' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                        Assign Teachers & Students
                    </button>
                </div>

                {/* View Tab */}
                {activeTab === 'view' && (
                    <>
                        {/* Building & Floor Selector */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Building2 size={16} /> Building
                                    </label>
                                    <select
                                        value={selectedBuilding || ''}
                                        onChange={(e) => setSelectedBuilding(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Choose building...</option>
                                        {buildings.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Layers size={16} /> Floor
                                    </label>
                                    <select
                                        value={selectedFloor || ''}
                                        onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
                                        disabled={!selectedBuilding}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                    >
                                        <option value="">Choose floor...</option>
                                        {floors.map((f) => (
                                            <option key={f.id} value={f.id}>Floor {f.floor_number}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <DoorOpen size={16} /> Classroom
                                    </label>
                                    <select
                                        value={selectedClassroom || ''}
                                        onChange={(e) => setSelectedClassroom(parseInt(e.target.value))}
                                        disabled={!selectedFloor}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                    >
                                        <option value="">Choose classroom...</option>
                                        {classrooms.map((c) => (
                                            <option key={c.id} value={c.id}>Room {c.room_number}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Classroom Details */}
                        {selectedClassroom && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Users size={20} /> Students in Classroom ({classroomStudents.length})
                                </h2>
                                {classroomStudents.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No students enrolled yet</p>
                                ) : (
                                    <div className="grid gap-2">
                                        {classroomStudents.map((s) => (
                                            <div key={s.student_id || s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <div>
                                                    <span className="font-medium">{s.name}</span>
                                                    <span className="text-gray-400 text-sm ml-2">{s.email}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveStudent(s.student_id || s.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Assign Tab */}
                {activeTab === 'assign' && (
                    <div className="space-y-6">
                        {/* Select Classroom */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg mb-4">Select Classroom</h2>
                            <select
                                value={selectedClassroom || ''}
                                onChange={(e) => {
                                    setSelectedClassroom(parseInt(e.target.value));
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Choose classroom...</option>
                                {allClassrooms.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.building_name} - Floor {c.floor_number} - Room {c.room_number}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedClassroom && (
                            <>
                                {/* Assign Teacher */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <UserPlus size={20} /> Assign Teacher
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <select
                                            value={assignTeacherId || ''}
                                            onChange={(e) => setAssignTeacherId(parseInt(e.target.value))}
                                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select teacher...</option>
                                            {teachers.map((t) => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={assignSubjectId || ''}
                                            onChange={(e) => setAssignSubjectId(parseInt(e.target.value) || null)}
                                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Subject (optional)</option>
                                            {subjects.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAssignTeacher}
                                            disabled={!assignTeacherId || submitting}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Assign Teacher
                                        </button>
                                    </div>
                                </div>

                                {/* Current Teachers */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <GraduationCap size={20} /> Assigned Teachers ({classroomTeachers.length})
                                    </h2>
                                    {classroomTeachers.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No teachers assigned</p>
                                    ) : (
                                        <div className="grid gap-2">
                                            {classroomTeachers.map((t) => (
                                                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{t.teacher_name}</span>
                                                        <div className="text-sm text-gray-500 flex gap-2">
                                                            <span>{t.teacher_email}</span>
                                                            {t.subject_name && (
                                                                <span className="bg-blue-100 text-blue-700 px-2 rounded-full text-xs flex items-center">
                                                                    {t.subject_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveTeacher(t.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Add Student */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Users size={20} /> Add Student to Classroom
                                    </h2>
                                    <div className="flex gap-4">
                                        <select
                                            value={assignStudentId || ''}
                                            onChange={(e) => setAssignStudentId(parseInt(e.target.value))}
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select student...</option>
                                            {students.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAddStudent}
                                            disabled={!assignStudentId || submitting}
                                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Add Student
                                        </button>
                                    </div>
                                </div>

                                {/* Current Students */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="font-bold text-lg mb-4">Current Students ({classroomStudents.length})</h2>
                                    {classroomStudents.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No students enrolled</p>
                                    ) : (
                                        <div className="grid gap-2">
                                            {classroomStudents.map((s) => (
                                                <div key={s.student_id || s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                    <span>{s.name}</span>
                                                    <button
                                                        onClick={() => handleRemoveStudent(s.student_id || s.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
