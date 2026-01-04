'use client';

import { useState, useEffect } from 'react';
import { getFullProfile } from '../../actions/auth';
import { Mail, GraduationCap, IdCard } from 'lucide-react';

interface StudentInfo {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image?: string;
}

export function StudentCard() {
    const [student, setStudent] = useState<StudentInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStudent() {
            const result = await getFullProfile();
            if (result.user) {
                setStudent(result.user);
            }
            setLoading(false);
        }
        loadStudent();
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 animate-pulse">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
            </div>
        );
    }

    if (!student) return null;

    const avatarUrl = student.profile_image ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`;

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100/50 shadow-sm">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-4">
                <div className="relative">
                    <img
                        src={avatarUrl}
                        alt={student.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <GraduationCap size={12} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Student Name */}
            <div className="text-center mb-4">
                <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
                <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold uppercase tracking-wide mt-1">
                    {student.role}
                </span>
            </div>

            {/* Student Info */}
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="text-orange-400" />
                    <span className="truncate text-xs">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <IdCard size={14} className="text-orange-400" />
                    <span className="text-xs">ID: #{student.id.toString().padStart(5, '0')}</span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-orange-100/50 my-3"></div>

            {/* Quick Stats or Actions */}
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/50 rounded-lg py-2 px-3">
                    <p className="text-lg font-bold text-slate-800">85%</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Attendance</p>
                </div>
                <div className="bg-white/50 rounded-lg py-2 px-3">
                    <p className="text-lg font-bold text-slate-800">A+</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Grade</p>
                </div>
            </div>
        </div>
    );
}
