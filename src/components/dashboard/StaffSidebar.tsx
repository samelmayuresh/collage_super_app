'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Building2, Layers, DoorOpen, LogOut, Menu, X, MapPin, User } from 'lucide-react';
import { logout } from '../../actions/auth';
import { UserCard } from './UserCard';

export function StaffSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = "flex items-center gap-3 p-3 text-gray-600 hover:bg-white rounded-xl transition-colors font-medium";
    const activeClass = "flex items-center gap-3 p-3 bg-green-600 text-white rounded-xl font-medium";

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#ECFDF5] px-4 py-3 flex items-center justify-between border-b border-green-100/50">
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
                lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-[#ECFDF5] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* User Card */}
                <div className="p-4">
                    <UserCard accentColor="green" />
                </div>

                <nav className="flex flex-col gap-2 px-4 pb-4">
                    <Link href="/dashboard/staff" onClick={() => setIsOpen(false)} className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/staff/buildings" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Building2 size={20} />
                        <span>Buildings</span>
                    </Link>
                    <Link href="/dashboard/staff/floors" onClick={() => setIsOpen(false)} className={linkClass}>
                        <Layers size={20} />
                        <span>Floors</span>
                    </Link>
                    <Link href="/dashboard/staff/classrooms" onClick={() => setIsOpen(false)} className={linkClass}>
                        <DoorOpen size={20} />
                        <span>Classrooms</span>
                    </Link>
                    <Link href="/dashboard/staff/location" onClick={() => setIsOpen(false)} className={linkClass}>
                        <MapPin size={20} />
                        <span>Floor Locations</span>
                    </Link>
                    <Link href="/dashboard/staff/profile" onClick={() => setIsOpen(false)} className={linkClass}>
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
            <aside className="hidden lg:flex w-64 bg-[#ECFDF5] flex-col border-r border-green-100/50 h-screen sticky top-0">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-4 border-b border-green-100/50">
                    <img src="/logo.png" alt="VARTAK_SA" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg">VARTAK_SA</span>
                </div>

                {/* User Card */}
                <div className="p-4">
                    <UserCard accentColor="green" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto">
                    <Link href="/dashboard/staff" className={activeClass}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/staff/buildings" className={linkClass}>
                        <Building2 size={20} />
                        <span>Buildings</span>
                    </Link>
                    <Link href="/dashboard/staff/floors" className={linkClass}>
                        <Layers size={20} />
                        <span>Floors</span>
                    </Link>
                    <Link href="/dashboard/staff/classrooms" className={linkClass}>
                        <DoorOpen size={20} />
                        <span>Classrooms</span>
                    </Link>
                    <Link href="/dashboard/staff/location" className={linkClass}>
                        <MapPin size={20} />
                        <span>Floor Locations</span>
                    </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-green-100/50 flex flex-col gap-2">
                    <Link href="/dashboard/staff/profile" className={linkClass}>
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
