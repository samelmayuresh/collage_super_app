'use client';

import { useEffect, useState } from 'react';
import { getApplicantDashboardData } from '../../../actions/admission';
import { Loader } from 'lucide-react';

export default function ApplicantDashboard() {
    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await getApplicantDashboardData();
            if (data.error) {
                setError(data.error);
            } else {
                setApplication(data.application);
            }
        } catch (err) {
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader className="animate-spin text-purple-600" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (!application) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto w-full relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Application Dashboard</h1>
                    <p className="text-gray-500">Track your admission status</p>
                </div>
                <a href="/" className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">
                    Home
                </a>
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl border mb-8 ${getStatusColor(application.status)}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-wide opacity-80 mb-1">Application Status</h2>
                        <div className="text-3xl font-extrabold">{application.status}</div>
                    </div>
                    {application.status === 'PENDING' && (
                        <div className="px-4 py-2 bg-white/50 rounded-lg text-sm font-medium backdrop-blur-sm">
                            Your application is under review.
                        </div>
                    )}
                </div>
                {application.remarks && (
                    <div className="mt-4 pt-4 border-t border-black/5">
                        <p className="font-semibold text-sm opacity-75 uppercase mb-1">Office Remarks:</p>
                        <p>{application.remarks}</p>
                    </div>
                )}

                {/* Payment / Admission Actions */}
                {application.status === 'APPROVED' && application.payment_status !== 'PAID' && (
                    <div className="mt-6 pt-6 border-t border-green-200">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-bold text-green-800">Application Approved!</h3>
                                <p className="text-sm text-green-700">Please pay the admission fees to confirm your seat.</p>
                            </div>
                            <a
                                href="/dashboard/applicant/payment"
                                className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center gap-2"
                            >
                                Pay Admission Fees
                            </a>
                        </div>
                    </div>
                )}

                {application.status === 'ADMITTED' && (
                    <div className="mt-6 pt-6 border-t border-green-200">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-bold text-green-800">Admission Confirmed</h3>
                                <p className="text-sm text-green-700">Explore your student dashboard.</p>
                            </div>
                            <a
                                href="/dashboard/student"
                                className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 flex items-center gap-2"
                            >
                                Go to Student Dashboard
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-slate-800">Application Details</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                            <p className="bg-gray-50 py-2 px-3 rounded-lg text-slate-700 font-medium border border-gray-100">{application.full_name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                            <p className="bg-gray-50 py-2 px-3 rounded-lg text-slate-700 font-medium border border-gray-100">{application.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                            <p className="bg-gray-50 py-2 px-3 rounded-lg text-slate-700 font-medium border border-gray-100">{application.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Course Applied</p>
                            <p className="bg-purple-50 py-2 px-3 rounded-lg text-purple-700 font-medium border border-purple-100">{application.preferred_course}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">10th Marks</p>
                            <p className="bg-gray-50 py-2 px-3 rounded-lg text-slate-700 font-medium border border-gray-100">{application.tenth_marks}%</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">12th Marks</p>
                            <p className="bg-gray-50 py-2 px-3 rounded-lg text-slate-700 font-medium border border-gray-100">{application.twelfth_marks}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
