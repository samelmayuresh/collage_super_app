'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Building2, Layers, DoorOpen, LogOut, Menu, X, MapPin, User, GraduationCap } from 'lucide-react';
import { logout } from '../../actions/auth';

export function StaffSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = "flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all font-medium";
    const activeClass = "flex items-center gap-3 px-4 py-3 text-green-600 bg-green-50 rounded-xl transition-all font-bold";

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        S
                    </div>
                    <span className="font-bold text-lg text-slate-800">Staff Panel</span>
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
                    <Link href="/dashboard/staff/classes" onClick={() => setIsOpen(false)} className={linkClass}>
                        <GraduationCap size={20} />
                        <span>Classes & Subjects</span>
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
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                    <span className="text-xl font-bold text-slate-800">Staff Panel</span>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
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
                    <Link href="/dashboard/staff/classes" className={linkClass}>
                        <GraduationCap size={20} />
                        <span>Classes & Subjects</span>
                    </Link>
                    <Link href="/dashboard/staff/location" className={linkClass}>
                        <MapPin size={20} />
                        <span>Floor Locations</span>
                    </Link>
                    <Link href="/dashboard/staff/profile" className={linkClass}>
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
