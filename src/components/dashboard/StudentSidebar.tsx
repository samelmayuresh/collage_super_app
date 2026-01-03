'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Calendar, Book, Settings, User, LogOut, Menu, X, Camera } from 'lucide-react';
import { logout } from '../../actions/auth';

export function StudentSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#FAEFE9] px-4 py-3 flex items-center justify-between border-b border-orange-100/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                    <span className="font-bold text-lg">CollegeSuperApp</span>
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
                lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-[#FAEFE9] z-50 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <nav className="flex flex-col gap-2 p-4">
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
                        href="#"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <Calendar size={20} />
                        <span className="font-medium">Calendar</span>
                    </Link>
                    <Link
                        href="#"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <Book size={20} />
                        <span className="font-medium">Courses</span>
                    </Link>
                    <Link
                        href="#"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </Link>
                    <Link
                        href="#"
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

            {/* Desktop Sidebar - Icon Only */}
            <aside className="hidden lg:flex w-20 xl:w-24 bg-[#FAEFE9] flex-col items-center py-8 border-r border-orange-100/50">
                <div className="mb-8">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        A
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-6 w-full items-center">
                    <Link href="/dashboard/student" className="p-3 bg-black text-white rounded-full">
                        <Home size={24} />
                    </Link>
                    <Link href="#" className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-full transition-colors">
                        <Calendar size={24} />
                    </Link>
                    <Link href="#" className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-full transition-colors">
                        <Book size={24} />
                    </Link>
                    <Link href="#" className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-full transition-colors">
                        <Settings size={24} />
                    </Link>
                </nav>

                <div className="mt-auto flex flex-col gap-4 items-center">
                    <Link href="#" className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-full transition-colors">
                        <User size={24} />
                    </Link>
                    <form action={logout}>
                        <button type="submit" className="p-3 text-red-400 hover:text-red-600 hover:bg-white rounded-full transition-colors">
                            <LogOut size={24} />
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
