'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
// Confetti removed to avoid dependency issues
// To keep it simple and robust, I'll use CSS Animation or just UI.

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-[#F5F7FA] p-4 flex items-center justify-center relative overflow-hidden">
            {/* Simple confetti background effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-4 h-4 bg-red-400 rounded-full animate-bounce"></div>
                <div className="absolute top-20 right-20 w-3 h-3 bg-blue-400 transform rotate-45 animate-pulse"></div>
                <div className="absolute bottom-10 left-1/4 w-5 h-5 bg-green-400 rounded-sm animate-spin"></div>
            </div>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle size={40} />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Congratulations!</h1>
                <p className="text-gray-500 mb-8">Your admission has been confirmed. Welcome to the family!</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="font-bold text-green-600 flex items-center gap-2">
                        Admission Confirmed <CheckCircle size={14} />
                    </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 text-sm text-indigo-800">
                    Your Student Dashboard is now ready. You can access your classes, schedule, and profile.
                </div>

                <Link
                    href="/dashboard/student"
                    className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                >
                    Go to Student Dashboard <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}
