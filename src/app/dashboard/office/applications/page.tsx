import { getSession } from '../../../../actions/auth';
import { redirect } from 'next/navigation';
import { getAllApplications } from '../../../../actions/admission';
import Link from 'next/link';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

export default async function ApplicationsListPage() {
    const session = await getSession();
    if (!session || session.role !== 'OFFICE_STAFF') {
        redirect('/signin');
    }

    const { applications, error } = await getAllApplications();

    if (error) {
        return <div className="p-8 text-red-500">Error loading applications: {error}</div>;
    }

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admission Applications</h1>
                    <p className="text-gray-500">Manage student enrollments</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <th className="p-6">Applicant</th>
                            <th className="p-6">Applied For</th>
                            <th className="p-6">Academic Score</th>
                            <th className="p-6 text-center">Date</th>
                            <th className="p-6 text-center">Status</th>
                            <th className="p-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {applications?.map((app: any) => (
                            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6">
                                    <div>
                                        <p className="font-bold text-slate-800">{app.full_name}</p>
                                        <p className="text-xs text-gray-500">{app.email}</p>
                                        <p className="text-xs text-gray-400">{app.phone}</p>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border border-purple-100">
                                        {app.preferred_course}
                                    </span>
                                </td>
                                <td className="p-6 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-600">10th: <span className="font-bold">{app.tenth_marks}%</span></span>
                                        <span className="text-gray-600">12th: <span className="font-bold">{app.twelfth_marks}%</span></span>
                                    </div>
                                </td>
                                <td className="p-6 text-center text-sm text-gray-500">
                                    {new Date(app.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-6 text-center">
                                    {app.status === 'PENDING' && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                            <Clock size={12} /> Pending
                                        </div>
                                    )}
                                    {app.status === 'APPROVED' && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                            <CheckCircle size={12} /> Approved
                                        </div>
                                    )}
                                    {app.status === 'REJECTED' && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                            <XCircle size={12} /> Rejected
                                        </div>
                                    )}
                                </td>
                                <td className="p-6 text-right">
                                    <Link
                                        href={`/dashboard/office/applications/${app.id}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                                    >
                                        <Eye size={16} />
                                        Review
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {applications?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-400">
                                    No applications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
