import { getSession } from '../../../actions/auth';
import { redirect } from 'next/navigation';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { getAllApplications } from '../../../actions/admission';
import { OfficeAnalytics } from '../../../components/dashboard/OfficeAnalytics';

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
        <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Office Dashboard</h1>
                <p className="text-gray-500">Welcome back, {session.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Applications</p>
                            <p className="text-4xl font-bold mt-2">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl"><Users size={24} /></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Pending Review</p>
                            <p className="text-4xl font-bold mt-2">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl"><Clock size={24} /></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Approved</p>
                            <p className="text-4xl font-bold mt-2">{stats.approved}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl"><CheckCircle size={24} /></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">New Today</p>
                            <p className="text-4xl font-bold mt-2">{stats.today}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl"><FileText size={24} /></div>
                    </div>
                </div>
            </div>

            {/* Analytics Charts */}
            <OfficeAnalytics />

            {/* Quick Actions */}
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
