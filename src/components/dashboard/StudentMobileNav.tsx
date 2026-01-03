'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StudentMobileNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <nav className="flex items-center justify-center gap-6 bg-white px-5 py-3 rounded-full shadow-lg border border-gray-100">
                {/* Profile - Left */}
                <Link
                    href="/dashboard/student/profile"
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isActive('/dashboard/student/profile')
                            ? 'bg-black text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <svg width="24" height="24" viewBox="0 0 104 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="52" cy="33" r="18" stroke="currentColor" strokeWidth="5" fill="none" />
                        <path d="M16 90C16 70 32 58 52 58C72 58 88 70 88 90" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                    </svg>
                </Link>

                {/* Scan QR - Center (Larger) */}
                <Link
                    href="/dashboard/student/scan"
                    className={`flex items-center justify-center w-16 h-16 rounded-full transition-all shadow-md ${isActive('/dashboard/student/scan')
                            ? 'bg-black text-white'
                            : 'bg-[#B9FF66] text-black hover:bg-[#a8e65c]'
                        }`}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                    </svg>
                </Link>

                {/* Dashboard/Home - Right */}
                <Link
                    href="/dashboard/student"
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isActive('/dashboard/student')
                            ? 'bg-black text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <svg width="24" height="24" viewBox="0 0 104 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100.5 40.75V96.5H66V68.5V65H62.5H43H39.5V68.5V96.5H3.5V40.75L52 4.375L100.5 40.75Z" stroke="currentColor" strokeWidth="5" fill="none" />
                    </svg>
                </Link>
            </nav>
        </div>
    );
}
