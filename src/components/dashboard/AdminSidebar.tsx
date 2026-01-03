'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Book, Upload, LogOut, Menu, X, User, Calendar, DoorOpen } from 'lucide-react';
import { logout } from '../../actions/auth';

export function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = "flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-medium";
    const activeClass = "flex items-center gap-3 px-4 py-3 text-indigo-600 bg-indigo-50 rounded-xl transition-all font-bold";

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                    <span className="font-bold text-lg text-slate-800">Admin Panel</span>
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
                    <Link href="/dashboard/admin" onClick={() => setIsOpen(false)} className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link href="/dashboard/admin/assignments" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Book size={20} />
                        <span>Assignments</span>
                    </Link>
                    <Link href="/dashboard/admin/timetable" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Calendar size={20} />
                        <span>Timetables</span>
                    </Link>
                    <Link href="/dashboard/admin/students" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Users size={20} />
                        <span>Students</span>
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
                        <button type="submit" className={linkClass + " w-full text-red-500 hover:text-red-600 hover:bg-red-50"}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white flex-col py-8 px-6 border-r border-gray-100">
                <div className="mb-10 flex items-center gap-2 px-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                    <span className="text-xl font-bold text-slate-800">Admin Panel</span>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
                    <Link href="/dashboard/admin" className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link href="/dashboard/admin/assignments" className={linkClass}>
                        <Book size={20} />
                        <span>Assignments</span>
                    </Link>
                    <Link href="/dashboard/admin/timetable" className={linkClass}>
                        <Calendar size={20} />
                        <span>Timetables</span>
                    </Link>
                    <Link href="/dashboard/admin/students" className={linkClass}>
                        <Users size={20} />
                        <span>Students</span>
                    </Link>
                    <Link href="/dashboard/admin/import" className={linkClass}>
                        <Upload size={20} />
                        <span>Bulk Import</span>
                    </Link>
                    <Link href="/dashboard/admin/profile" className={linkClass}>
                        <User size={20} />
                        <span>Profile</span>
                    </Link>
                </nav>

                <div className="mt-auto">
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
