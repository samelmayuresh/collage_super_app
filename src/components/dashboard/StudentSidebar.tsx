'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Calendar, Book, Settings, User, LogOut, Menu, X, Camera } from 'lucide-react';
import { logout } from '../../actions/auth';
import { UserCard } from './UserCard';

export function StudentSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#FAEFE9] px-4 py-3 flex items-center justify-between border-b border-orange-100/50">
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
                lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-[#FAEFE9] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Student Card in Mobile */}
                <div className="p-4">
                    <UserCard accentColor="orange" />
                </div>

                <nav className="flex flex-col gap-2 px-4 pb-4">
                    <Link
                        href="/dashboard/student"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 bg-black text-white rounded-xl"
                    >
                        <Home size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        href="/dashboard/student/scan"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <Camera size={20} />
                        <span className="font-medium">Scan QR</span>
                    </Link>
                    <Link
                        href="/dashboard/student/calendar"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <Calendar size={20} />
                        <span className="font-medium">Calendar</span>
                    </Link>
                    <Link
                        href="/dashboard/student/courses"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <Book size={20} />
                        <span className="font-medium">Courses</span>
                    </Link>
                    <Link
                        href="/dashboard/student/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </Link>
                    <Link
                        href="/dashboard/student/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <User size={20} />
                        <span className="font-medium">Profile</span>
                    </Link>

                    <form action={logout} className="mt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Desktop Sidebar - Full Width with StudentCard */}
            <aside className="hidden lg:flex w-64 bg-[#FAEFE9] flex-col border-r border-orange-100/50 h-screen sticky top-0">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-4 border-b border-orange-100/50">
                    <img src="/logo.png" alt="VARTAK_SA" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg">VARTAK_SA</span>
                </div>

                {/* Student Card */}
                <div className="p-4">
                    <UserCard accentColor="orange" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto">
                    <Link href="/dashboard/student" className="flex items-center gap-3 p-3 bg-black text-white rounded-xl">
                        <Home size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/student/scan" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors">
                        <Camera size={20} />
                        <span className="font-medium">Scan QR</span>
                    </Link>
                    <Link href="/dashboard/student/calendar" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors">
                        <Calendar size={20} />
                        <span className="font-medium">Calendar</span>
                    </Link>
                    <Link href="/dashboard/student/courses" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors">
                        <Book size={20} />
                        <span className="font-medium">Courses</span>
                    </Link>
                    <Link href="/dashboard/student/settings" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors">
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-orange-100/50 flex flex-col gap-2">
                    <Link href="/dashboard/student/profile" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors">
                        <User size={20} />
                        <span className="font-medium">Edit Profile</span>
                    </Link>
                    <form action={logout}>
                        <button type="submit" className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full">
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
