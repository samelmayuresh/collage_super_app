'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, BookOpen, User, Loader2, Plus, X, CheckCircle, GraduationCap, MapPin, Building2 } from 'lucide-react';
import { getAllStudents } from '../../../../actions/students';
import { getTeacherClassrooms, addStudentToClassroom, getMyStudents } from '../../../../actions/classroomAssignments';

interface Student {
    id: number;
    name: string;
    email: string;
    // Extra fields for MyStudents view
    classroom_id?: number;
    room_number?: string;
    building_name?: string;
    branch?: string | null;
    admission_category?: string | null;
    // Extra fields for Global view
    role?: string;
}

interface Classroom {
    id: number; // assignment id, but we need classroom_id
    classroom_id: number;
    room_number: string;
    floor_number: number;
    building_name: string;
    subject_name?: string;
}

export default function TeacherStudentsPage() {
    const [myStudents, setMyStudents] = useState<Student[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]); // Global list for searching
    const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClassroomId, setFilterClassroomId] = useState<string>('');
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterBranch, setFilterBranch] = useState<string>('');

    // Constants
    const ADMISSION_TYPES = [
        { id: 'FY', name: 'First Year (FY)' },
        { id: 'DSY', name: 'Direct Second Year (DSY)' }
    ];
    const BRANCH_OPTIONS = [
        { id: 'CS', name: 'Computer Science' },
        { id: 'IT', name: 'Information Technology' },
        { id: 'EXTC', name: 'Electronics & Telecom' },
        { id: 'MECH', name: 'Mechanical Engineering' },
        { id: 'CIVIL', name: 'Civil Engineering' },
        { id: 'AI', name: 'Artificial Intelligence' },
    ];

    // Enroll Modal
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [enrollModalOpen, setEnrollModalOpen] = useState(false);
    const [enrollClassroomId, setEnrollClassroomId] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [myStudentsRes, classroomsRes] = await Promise.all([
            getMyStudents(),
            getTeacherClassrooms()
        ]);

        if (myStudentsRes.students) setMyStudents(myStudentsRes.students);
        if (classroomsRes.classrooms) setMyClassrooms(classroomsRes.classrooms);

        // Load global students for enrollment search only if needed (lazy load?)
        // Let's load them initially for simplicity in search
        const allRes = await getAllStudents();
        if (allRes.students) setAllStudents(allRes.students);

        setLoading(false);
    }

    // Filter logic
    // If filterClassroomId is set, show only myStudents in that classroom.
    // If filterClassroomId is "GLOBAL", show allStudents matching search.
    // If empty, show all myStudents.

    const isGlobalSearch = filterClassroomId === 'GLOBAL';

    const displayedStudents = isGlobalSearch
        ? allStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : myStudents.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesClass = filterClassroomId
                ? s.classroom_id?.toString() === filterClassroomId
                : true;

            const matchesYear = filterYear
                ? s.admission_category === filterYear
                : true;

            const matchesBranch = filterBranch
                ? s.branch === filterBranch
                : true;

            return matchesSearch && matchesClass && matchesYear && matchesBranch;
        });

    async function handleEnroll() {
        if (!selectedStudent || !enrollClassroomId) return;

        setEnrolling(true);
        const result = await addStudentToClassroom(selectedStudent.id, parseInt(enrollClassroomId));

        if (result.success) {
            setEnrollModalOpen(false);
            // Refresh my students list
            const res = await getMyStudents();
            if (res.students) setMyStudents(res.students);

            // Reset fields
            setEnrollClassroomId('');
            alert(`Student enrolled successfully!`);
        } else {
            alert(result.error || 'Failed to enroll student');
        }
        setEnrolling(false);
    }

    function openEnrollModal(student: Student) {
        setSelectedStudent(student);
        // Pre-select if they are already in one of my classrooms?
        // Note: fetchMyStudents returns row per classroom per student. 
        // But the student object from global list won't have classroom_id set.
        setEnrollClassroomId('');
        setEnrollModalOpen(true);
    }

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
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Students</h1>
                        <p className="text-gray-500">View and manage students in your classrooms</p>
                    </div>

                    <button
                        onClick={() => setFilterClassroomId('GLOBAL')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} />
                        Enroll New Student
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search student by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-4 sm:w-auto w-full flex-col sm:flex-row flex-wrap">
                        <div className="w-full sm:w-40">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white appearance-none"
                                >
                                    <option value="">All Years</option>
                                    {ADMISSION_TYPES.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="w-full sm:w-40">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={filterBranch}
                                    onChange={(e) => setFilterBranch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white appearance-none"
                                >
                                    <option value="">All Branches</option>
                                    {BRANCH_OPTIONS.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="w-full sm:w-64">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={filterClassroomId}
                                    onChange={(e) => setFilterClassroomId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white appearance-none"
                                >
                                    <option value="">All My Classrooms</option>
                                    <option value="GLOBAL">Global Directory (Search All)</option>
                                    <hr />
                                    {myClassrooms.map(c => (
                                        <option key={`${c.classroom_id}-${c.subject_name}`} value={c.classroom_id}>
                                            {c.building_name} - Room {c.room_number} {c.subject_name ? `(${c.subject_name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Student</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Classroom</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayedStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                                            <GraduationCap size={48} className="text-gray-300" />
                                            <p>No students found.</p>
                                            {!isGlobalSearch && (
                                                <button
                                                    onClick={() => setFilterClassroomId('GLOBAL')}
                                                    className="text-indigo-600 hover:underline text-sm font-medium mt-2"
                                                >
                                                    Search Global Directory to Enroll
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    displayedStudents.map((student, idx) => {
                                        // For global search, student.classroom_id is undefined
                                        // For myStudents, it is defined.

                                        // Check if already enrolled in ANY of my classrooms (rough check)
                                        // Ideally we check per classroom but user might belong to multiple.
                                        // For now, if "Global", we offer "Enroll". 
                                        // If "My Students", we offer "Edit" (maybe verify enrollment).

                                        const isMyStudent = myStudents.some(ms => ms.id === student.id);

                                        return (
                                            <tr key={student.id + '-' + idx} className="hover:bg-gray-50/50 transition-colors">
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
                                                    {isGlobalSearch ? (
                                                        <span className="text-gray-400 text-sm italic">Global Directory</span>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Building2 size={14} className="text-gray-400" />
                                                            <span>{student.building_name}</span>
                                                            <span className="text-gray-300">|</span>
                                                            <span className="font-medium">Room {student.room_number}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => openEnrollModal(student)}
                                                        className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium border border-transparent hover:border-indigo-100 transition-all"
                                                    >
                                                        {isGlobalSearch ? 'Enroll' : 'Change / Add'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Enroll Modal */}
            {enrollModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Enroll Student</h2>
                            <button onClick={() => setEnrollModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-4">Adding <span className="font-bold text-slate-800">{selectedStudent.name}</span> to:</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Classroom</label>
                                    <select
                                        value={enrollClassroomId}
                                        onChange={(e) => setEnrollClassroomId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-gray-50"
                                    >
                                        <option value="">Choose a classroom...</option>
                                        {myClassrooms.map(c => (
                                            <option key={`${c.classroom_id}-${c.subject_name}`} value={c.classroom_id}>
                                                {c.building_name} - Room {c.room_number} {c.subject_name ? `(${c.subject_name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <CheckCircle size={12} className="text-green-500" />
                                        Student will be able to mark attendance for this room.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEnrollModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling || !enrollClassroomId}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {enrolling && <Loader2 size={16} className="animate-spin" />}
                                Enroll Student
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
