'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { logout } from '../../actions/auth';

export function OfficeSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? 'bg-[#B9FF66] text-black shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-slate-900';
    };

    return (
        <aside className="w-64 border-r border-gray-200 bg-white flex flex-col hidden lg:flex h-screen sticky top-0">
            {/* Logo */}
            <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-100">
                <img src="/logo.png" alt="VARTAK_SA" className="w-8 h-8 object-contain" />
                <span className="font-bold text-xl tracking-tight">VARTAK_SA</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2 px-2">
                    Office Management
                </div>

                <Link href="/dashboard/office" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${isActive('/dashboard/office')}`}>
                    <LayoutDashboard size={20} />
                    Overview
                </Link>

                <Link href="/dashboard/office/applications" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${isActive('/dashboard/office/applications')}`}>
                    <FileText size={20} />
                    New Enrollments
                </Link>

                <div className="my-4 border-t border-gray-100 pt-4">
                    <Link href="/dashboard/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${isActive('/dashboard/settings')}`}>
                        <Settings size={20} />
                        Settings
                    </Link>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 w-full transition-colors font-medium"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
