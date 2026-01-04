'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X, User, Database } from 'lucide-react';
import { logout } from '../../actions/auth';
import { UserCard } from './UserCard';

export function OfficeSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = "flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors font-medium";
    const activeClass = "flex items-center gap-3 p-3 bg-purple-600 text-white rounded-xl font-medium";

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#FAF5FF] px-4 py-3 flex items-center justify-between border-b border-purple-100/50">
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
                lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-[#FAF5FF] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* User Card */}
                <div className="p-4">
                    <UserCard accentColor="purple" />
                </div>

                <nav className="flex flex-col gap-2 px-4 pb-4">
                    <Link href="/dashboard/office" onClick={() => setIsOpen(false)} className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </Link>
                    <Link href="/dashboard/office/applications" onClick={() => setIsOpen(false)} className={linkClass}>
                        <FileText size={20} />
                        <span>New Enrollments</span>
                    </Link>
                    <Link href="/dashboard/office/data" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Database size={20} />
                        <span>Data Engine</span>
                    </Link>
                    <Link href="/dashboard/office/settings" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                    <Link href="/dashboard/office/profile" onClick={() => setIsOpen(false)} className={linkClass}>
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
            <aside className="hidden lg:flex w-64 bg-[#FAF5FF] flex-col border-r border-purple-100/50 h-screen sticky top-0">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-4 border-b border-purple-100/50">
                    <img src="/logo.png" alt="VARTAK_SA" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg">VARTAK_SA</span>
                </div>

                {/* User Card */}
                <div className="p-4">
                    <UserCard accentColor="purple" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                        Office Management
                    </div>
                    <Link href="/dashboard/office" className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </Link>
                    <Link href="/dashboard/office/applications" className={linkClass}>
                        <FileText size={20} />
                        <span>New Enrollments</span>
                    </Link>
                    <Link href="/dashboard/office/data" className={linkClass}>
                        <Database size={20} />
                        <span>Data Engine</span>
                    </Link>
                    <Link href="/dashboard/office/settings" className={linkClass}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-purple-100/50 flex flex-col gap-2">
                    <Link href="/dashboard/office/profile" className={linkClass}>
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
