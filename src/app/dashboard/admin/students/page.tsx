'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Plus, X, Building2, CheckSquare, Square } from 'lucide-react';
import { getAllStudents } from '../../../../actions/students';
import { getAllClassroomsWithDetails, addStudentToClassroom, bulkAssignStudentsToClassroom } from '../../../../actions/classroomAssignments';
import { getBuildings, getFloors, getClassrooms } from '../../../../actions/buildings';
import Link from 'next/link';

interface Student {
    id: number;
    name: string;
    email: string;
    role: string;
    classroom_id?: number | null;
    room_number?: string | null;
    building_name?: string | null;
    class_name?: string | null;
    created_at: string;
}

interface Classroom {
    id: number;
    room_number: string;
    floor_number: number;
    building_name: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]); // For Filter
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClassroom, setFilterClassroom] = useState<string>('');

    // Class Assignment State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]); // Bulk Selection
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignClassroomId, setAssignClassroomId] = useState('');
    const [assigning, setAssigning] = useState(false);

    // Cascaded Selection State (for Modal)
    const [buildings, setBuildings] = useState<any[]>([]);
    const [floors, setFloors] = useState<any[]>([]);
    const [roomOptions, setRoomOptions] = useState<any[]>([]); // Classrooms for the selected floor
    const [selBuilding, setSelBuilding] = useState<string>('');
    const [selFloor, setSelFloor] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    // Load Buildings when modal opens
    useEffect(() => {
        if (assignModalOpen) {
            loadBuildings();
        } else {
            // Reset selectors when modal closes
            setSelBuilding('');
            setSelFloor('');
            setRoomOptions([]);
        }
    }, [assignModalOpen]);

    // Cascaded Load: Floors
    useEffect(() => {
        if (selBuilding) {
            loadFloors(parseInt(selBuilding));
            setSelFloor('');
            setRoomOptions([]);
            setAssignClassroomId('');
        } else {
            setFloors([]);
            setRoomOptions([]);
            setAssignClassroomId('');
        }
    }, [selBuilding]);

    // Cascaded Load: Rooms
    useEffect(() => {
        if (selFloor) {
            loadRooms(parseInt(selFloor));
            setAssignClassroomId('');
        } else {
            setRoomOptions([]);
            setAssignClassroomId('');
        }
    }, [selFloor]);

    async function loadData() {
        setLoading(true);
        const [studentsRes, classroomsRes] = await Promise.all([
            getAllStudents(),
            getAllClassroomsWithDetails()
        ]);

        if (studentsRes.students) setStudents(studentsRes.students);
        if (classroomsRes.classrooms) setClassrooms(classroomsRes.classrooms);
        setLoading(false);
    }

    async function loadBuildings() {
        const res = await getBuildings();
        if (res.buildings) setBuildings(res.buildings);
    }

    async function loadFloors(buildingId: number) {
        const res = await getFloors(buildingId);
        if (res.floors) setFloors(res.floors);
    }

    async function loadRooms(floorId: number) {
        const res = await getClassrooms(floorId);
        if (res.classrooms) setRoomOptions(res.classrooms);
    }

    async function handleAssignClassroom() {
        if (!selectedStudent && selectedIds.length === 0) return;
        if (!assignClassroomId) return;

        setAssigning(true);

        let result;
        if (selectedStudent) {
            // Single Mode
            result = await addStudentToClassroom(selectedStudent.id, parseInt(assignClassroomId));
        } else {
            // Bulk Mode
            result = await bulkAssignStudentsToClassroom(selectedIds, parseInt(assignClassroomId));
        }

        if (result.success) {
            setAssignModalOpen(false);
            setAssignClassroomId('');
            setSelectedIds([]); // Clear selection
            setSelectedStudent(null);
            loadData(); // Refresh list
        } else {
            alert(result.error || 'Failed to assign classroom');
        }
        setAssigning(false);
    }

    function openAssignModal(student: Student) {
        setSelectedStudent(student);
        // We don't pre-fill cascading selectors (complex logic to reverse map room->floor->building)
        // It's cleaner to ask them to select fresh.
        setAssignClassroomId('');
        setAssignModalOpen(true);
    }

    function openBulkAssignModal() {
        setSelectedStudent(null);
        setAssignClassroomId('');
        setAssignModalOpen(true);
    }

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesClassroom = filterClassroom
            ? student.classroom_id?.toString() === filterClassroom
            : true;

        return matchesSearch && matchesClassroom;
    });

    function toggleSelectAll() {
        if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredStudents.map(s => s.id));
        }
    }

    function toggleSelect(id: number) {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-96">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    const isAllSelected = filteredStudents.length > 0 && selectedIds.length === filteredStudents.length;

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA] relative">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Students</h1>
                        <p className="text-gray-500">Manage all student accounts and classroom enrollments</p>
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
                            placeholder="Search by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <select
                            value={filterClassroom}
                            onChange={(e) => setFilterClassroom(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white"
                        >
                            <option value="">All Classrooms</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.building_name} - {c.room_number} (F{c.floor_number})
                                </option>
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
                                    <th className="p-4 w-10">
                                        <button
                                            onClick={toggleSelectAll}
                                            className="text-gray-400 hover:text-indigo-600 flex items-center"
                                        >
                                            {isAllSelected ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                                        </button>
                                    </th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Student</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Classroom</th>
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
                                    filteredStudents.map((student) => {
                                        const isSelected = selectedIds.includes(student.id);
                                        return (
                                            <tr key={student.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => toggleSelect(student.id)}
                                                        className="text-gray-400 hover:text-indigo-600 flex items-center"
                                                    >
                                                        {isSelected ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                                                    </button>
                                                </td>
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
                                                    {student.building_name ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Building2 size={14} className="text-gray-400" />
                                                            <span>{student.building_name}</span>
                                                            <span className="text-gray-300">|</span>
                                                            <span className="font-medium">Room {student.room_number}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm italic">Unassigned</span>
                                                    )}
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
                                                        {student.building_name ? 'Change' : 'Assign'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bulk Selection Floating Bar */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-6 z-40 animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                {selectedIds.length}
                            </div>
                            <span className="font-semibold text-slate-800">Students Selected</span>
                        </div>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <button
                            onClick={openBulkAssignModal}
                            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                        >
                            Assign Classroom
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Assign Classroom Modal (Shared for Single & Bulk) */}
            {assignModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {selectedStudent ? 'Assign Student' : `Assign ${selectedIds.length} Students`}
                            </h2>
                            <button onClick={() => setAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-4">
                                {selectedStudent
                                    ? <span>Assigning <span className="font-bold text-slate-800">{selectedStudent.name}</span> to a classroom.</span>
                                    : <span>Assigning <span className="font-bold text-slate-800">{selectedIds.length} students</span>. Roll numbers will be automatically generated.</span>
                                }
                            </p>

                            <div className="space-y-4">
                                {/* Building Select */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Building</label>
                                    <select
                                        value={selBuilding}
                                        onChange={(e) => setSelBuilding(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white"
                                    >
                                        <option value="">Select Building...</option>
                                        {buildings.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Floor Select */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Floor</label>
                                    <select
                                        value={selFloor}
                                        onChange={(e) => setSelFloor(e.target.value)}
                                        disabled={!selBuilding}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                                    >
                                        <option value="">Select Floor...</option>
                                        {floors.map(f => (
                                            <option key={f.id} value={f.id}>{f.floor_number}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Classroom Select */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Classroom</label>
                                    <select
                                        value={assignClassroomId}
                                        onChange={(e) => setAssignClassroomId(e.target.value)}
                                        disabled={!selFloor}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                                    >
                                        <option value="">Select Classroom...</option>
                                        {roomOptions.map(c => (
                                            <option key={c.id} value={c.id}>
                                                Room {c.room_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setAssignModalOpen(false)}
                                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignClassroom}
                                disabled={assigning || !assignClassroomId}
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
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
