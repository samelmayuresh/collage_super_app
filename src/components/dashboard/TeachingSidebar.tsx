'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, Video, FileText, Settings, HelpCircle, LogOut, Menu, X, History, User, Calendar, BarChart3 } from 'lucide-react';
import { logout } from '../../actions/auth';

export function TeachingSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = "flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium";
    const activeClass = "flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-xl transition-all font-bold";

    return (
        <>
            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        L
                    </div>
                    <span className="font-bold text-lg text-slate-800">Learnthru</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-lg
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <nav className="flex flex-col gap-2 p-4">
                    <Link
                        href="/dashboard/teaching"
                        onClick={() => setIsOpen(false)}
                        className={activeClass}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/dashboard/teaching/attendance"
                        onClick={() => setIsOpen(false)}
                        className={linkClass}
                    >
                        <Users size={20} />
                        <span>Attendance</span>
                    </Link>
                    <Link
                        href="/dashboard/teaching/history"
                        onClick={() => setIsOpen(false)}
                        className={linkClass}
                    >
                        <History size={20} />
                        <span>History</span>
                    </Link>
                    <Link
                        href="/dashboard/teaching/notice"
                        onClick={() => setIsOpen(false)}
                        className={linkClass}
                    >
                        <FileText size={20} />
                        <span>Notice</span>
                    </Link>
                    <Link
                        href="/dashboard/teaching/calendar"
                        onClick={() => setIsOpen(false)}
                        className={linkClass}
                    >
                        <Calendar size={20} />
                        <span>Calendar</span>
                    </Link>
                    <Link
                        href="/dashboard/teaching/analytics"
                        onClick={() => setIsOpen(false)}
                        className={linkClass}
                    >
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </Link>
                    <Link
                        href="/dashboard/teaching/timetable"
                        onClick={() => setIsOpen(false)}
                        className={linkClass}
                    >
                        <BookOpen size={20} />
                        <span>Timetable</span>
                    </Link>
                    <Link
                        href="/dashboard/teaching/quiz"
                        onClick={() => setIsOpen(false)}
                        className={linkClass}
                    >
                        <Video size={20} />
                        <span>Mini Exam</span>
                    </Link>
                    <Link
                        href="/dashboard/teaching/profile"
                        onClick={() => setIsOpen(false)}
                        className={linkClass}
                    >
                        <User size={20} />
                        <span>Profile</span>
                    </Link>

                    <div className="mt-4 p-4 bg-blue-50 rounded-2xl text-center">
                        <div className="w-10 h-10 bg-blue-200 rounded-full mx-auto mb-2 flex items-center justify-center text-xl">?</div>
                        <h4 className="font-bold text-sm mb-1">Need help?</h4>
                        <p className="text-xs text-gray-500">Check our docs</p>
                    </div>

                    <form action={logout} className="mt-4">
                        <button
                            type="submit"
                            className={linkClass + " w-full text-red-500 hover:text-red-600 hover:bg-red-50"}
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white flex-col py-8 px-6 border-r border-gray-100">
                {/* Logo */}
                <div className="mb-10 flex items-center gap-2 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <span className="text-xl font-bold text-slate-800">Learnthru</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 flex flex-col gap-2">
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
                    <Link href="/dashboard/teaching/timetable" className={linkClass}>
                        <BookOpen size={20} />
                        <span>Timetable</span>
                    </Link>
                    <Link href="/dashboard/teaching/quiz" className={linkClass}>
                        <Video size={20} />
                        <span>Mini Exam</span>
                    </Link>
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col gap-2">
                    <Link href="/dashboard/teaching/profile" className={linkClass}>
                        <User size={20} />
                        <span>Profile</span>
                    </Link>
                    <div className="p-4 bg-blue-50 rounded-2xl mb-4 text-center">
                        <div className="w-10 h-10 bg-blue-200 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">?</div>
                        <h4 className="font-bold text-sm mb-1">Need help?</h4>
                        <p className="text-xs text-gray-500">Check our docs</p>
                    </div>

                    <form action={logout}>
                        <button type="submit" className={linkClass + " w-full text-red-500 hover:text-red-600 hover:bg-red-50"}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
