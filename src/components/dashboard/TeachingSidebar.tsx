'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, Menu, X, History, User, Calendar, BarChart3 } from 'lucide-react';
import { logout } from '../../actions/auth';
import { UserCard } from './UserCard';

export function TeachingSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = "flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors font-medium";
    const activeClass = "flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl font-medium";

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#EEF4FF] px-4 py-3 flex items-center justify-between border-b border-blue-100/50">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="VARTAK_SA" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg">VARTAK_SA</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-700 hover:bg-white rounded-lg transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Slide-out Menu */}
            <aside className={`
                lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-[#EEF4FF] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* User Card */}
                <div className="p-4">
                    <UserCard accentColor="blue" />
                </div>

                <nav className="flex flex-col gap-2 px-4 pb-4">
                    <Link href="/dashboard/teaching" onClick={() => setIsOpen(false)} className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/teaching/attendance" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Users size={20} />
                        <span>Attendance</span>
                    </Link>
                    <Link href="/dashboard/teaching/history" onClick={() => setIsOpen(false)} className={linkClass}>
                        <History size={20} />
                        <span>History</span>
                    </Link>
                    <Link href="/dashboard/teaching/notice" onClick={() => setIsOpen(false)} className={linkClass}>
                        <FileText size={20} />
                        <span>Notice</span>
                    </Link>
                    <Link href="/dashboard/teaching/students" onClick={() => setIsOpen(false)} className={linkClass}>
                        <BookOpen size={20} />
                        <span>My Students</span>
                    </Link>
                    <Link href="/dashboard/teaching/calendar" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Calendar size={20} />
                        <span>Calendar</span>
                    </Link>
                    <Link href="/dashboard/teaching/analytics" onClick={() => setIsOpen(false)} className={linkClass}>
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </Link>
                    <Link href="/dashboard/teaching/profile" onClick={() => setIsOpen(false)} className={linkClass}>
                        <User size={20} />
                        <span>Profile</span>
                    </Link>

                    <form action={logout} className="mt-4">
                        <button type="submit" className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full font-medium">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-[#EEF4FF] flex-col border-r border-blue-100/50 h-screen sticky top-0">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-4 border-b border-blue-100/50">
                    <img src="/logo.png" alt="VARTAK_SA" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg">VARTAK_SA</span>
                </div>

                {/* User Card */}
                <div className="p-4">
                    <UserCard accentColor="blue" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto">
                    <Link href="/dashboard/teaching" className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/teaching/attendance" className={linkClass}>
                        <Users size={20} />
                        <span>Attendance</span>
                    </Link>
                    <Link href="/dashboard/teaching/history" className={linkClass}>
                        <History size={20} />
                        <span>History</span>
                    </Link>
                    <Link href="/dashboard/teaching/notice" className={linkClass}>
                        <FileText size={20} />
                        <span>Notice</span>
                    </Link>
                    <Link href="/dashboard/teaching/students" className={linkClass}>
                        <BookOpen size={20} />
                        <span>My Students</span>
                    </Link>
                    <Link href="/dashboard/teaching/calendar" className={linkClass}>
                        <Calendar size={20} />
                        <span>Calendar</span>
                    </Link>
                    <Link href="/dashboard/teaching/analytics" className={linkClass}>
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-blue-100/50 flex flex-col gap-2">
                    <Link href="/dashboard/teaching/profile" className={linkClass}>
                        <User size={20} />
                        <span>Edit Profile</span>
                    </Link>
                    <form action={logout}>
                        <button type="submit" className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full font-medium">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
