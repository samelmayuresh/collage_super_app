'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Book, BookOpen, Upload, LogOut, Menu, X, User, Calendar, Database } from 'lucide-react';
import { logout } from '../../actions/auth';
import { UserCard } from './UserCard';

export function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = "flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors font-medium";
    const activeClass = "flex items-center gap-3 p-3 bg-indigo-600 text-white rounded-xl font-medium";

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#EEF2FF] px-4 py-3 flex items-center justify-between border-b border-indigo-100/50">
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
                lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-[#EEF2FF] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* User Card */}
                <div className="p-4">
                    <UserCard accentColor="indigo" />
                </div>

                <nav className="flex flex-col gap-2 px-4 pb-4">
                    <Link href="/dashboard/admin" onClick={() => setIsOpen(false)} className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/admin/assignments" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Book size={20} />
                        <span>Assignments</span>
                    </Link>
                    <Link href="/dashboard/admin/subjects" onClick={() => setIsOpen(false)} className={linkClass}>
                        <BookOpen size={20} />
                        <span>Subjects</span>
                    </Link>
                    <Link href="/dashboard/admin/students" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Users size={20} />
                        <span>Students</span>
                    </Link>
                    <Link href="/dashboard/admin/calendar" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Calendar size={20} />
                        <span>Calendar</span>
                    </Link>
                    <Link href="/dashboard/admin/data" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Database size={20} />
                        <span>Data Engine</span>
                    </Link>
                    <Link href="/dashboard/admin/import" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Upload size={20} />
                        <span>Bulk Import</span>
                    </Link>
                    <Link href="/dashboard/admin/profile" onClick={() => setIsOpen(false)} className={linkClass}>
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
            <aside className="hidden lg:flex w-64 bg-[#EEF2FF] flex-col border-r border-indigo-100/50 h-screen sticky top-0">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-4 border-b border-indigo-100/50">
                    <img src="/logo.png" alt="VARTAK_SA" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg">VARTAK_SA</span>
                </div>

                {/* User Card */}
                <div className="p-4">
                    <UserCard accentColor="indigo" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto">
                    <Link href="/dashboard/admin" className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/admin/assignments" className={linkClass}>
                        <Book size={20} />
                        <span>Assignments</span>
                    </Link>
                    <Link href="/dashboard/admin/subjects" className={linkClass}>
                        <BookOpen size={20} />
                        <span>Subjects</span>
                    </Link>
                    <Link href="/dashboard/admin/students" className={linkClass}>
                        <Users size={20} />
                        <span>Students</span>
                    </Link>
                    <Link href="/dashboard/admin/calendar" className={linkClass}>
                        <Calendar size={20} />
                        <span>Calendar</span>
                    </Link>
                    <Link href="/dashboard/admin/data" className={linkClass}>
                        <Database size={20} />
                        <span>Data Engine</span>
                    </Link>
                    <Link href="/dashboard/admin/import" className={linkClass}>
                        <Upload size={20} />
                        <span>Bulk Import</span>
                    </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-indigo-100/50 flex flex-col gap-2">
                    <Link href="/dashboard/admin/profile" className={linkClass}>
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
