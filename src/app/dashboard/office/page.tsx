import { getSession } from '../../../actions/auth';
import { redirect } from 'next/navigation';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { getAllApplications } from '../../../actions/admission';

export default async function OfficeDashboard() {
    const session = await getSession();
    if (!session || session.role !== 'OFFICE_STAFF') {
        redirect('/signin');
    }

    const result = await getAllApplications();
    const applications = result.applications || [];

    const stats = {
        total: applications.length,
        pending: applications.filter((a: any) => a.status === 'PENDING').length,
        approved: applications.filter((a: any) => a.status === 'APPROVED').length,
        today: applications.filter((a: any) => {
            const date = new Date(a.created_at);
            const today = new Date();
            return date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        }).length
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Office Dashboard</h1>
                <p className="text-gray-500">Welcome back, {session.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Applications</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending Review</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Approved</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.approved}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">New Today</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.today}</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/dashboard/office/applications" className="block p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors border border-dashed border-gray-300 hover:border-purple-300">
                        <div className="flex items-center gap-3 font-semibold">
                            <FileText size={20} />
                            Process New Enrollments
                        </div>
                        <p className="text-sm text-gray-500 mt-1 ml-8">Review pending applications and assign classrooms.</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
