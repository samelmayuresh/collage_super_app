import { getSession } from '../../../../../actions/auth';
import { redirect } from 'next/navigation';
import { appDb } from '../../../../../../lib/db';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ApplicationActions from './ApplicationActions';

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || (session.role !== 'OFFICE_STAFF' && session.role !== 'ADMIN')) {
        redirect('/signin');
    }

    const { id } = await params;

    // Direct DB Query (Server Side)
    const result = await appDb.query('SELECT * FROM admission_applications WHERE id = $1', [id]);
    const app = result.rows[0];

    if (!app) {
        return <div className="p-8">Application not found</div>;
    }

    return (
        <div className="p-8 w-full max-w-4xl mx-auto">
            <Link href="/dashboard/office/applications" className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-800 transition-colors mb-6 font-medium">
                <ChevronLeft size={20} />
                Back to List
            </Link>

            <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{app.full_name}</h1>
                    <p className="text-gray-500 mt-1">Application #{app.id} • {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}>
                        {app.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-slate-800 mb-4 border-b border-gray-100 pb-2">Academic Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Preferred Course</p>
                                <p className="font-medium text-slate-800 mt-1">{app.preferred_course}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">12th Marks</p>
                                <p className="font-medium text-slate-800 mt-1">{app.twelfth_marks}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">10th Marks</p>
                                <p className="font-medium text-slate-800 mt-1">{app.tenth_marks}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-slate-800 mb-4 border-b border-gray-100 pb-2">Personal & Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                                <p className="font-medium text-slate-800 mt-1">{app.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Phone</p>
                                <p className="font-medium text-slate-800 mt-1">{app.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Date of Birth</p>
                                <p className="font-medium text-slate-800 mt-1">{app.dob ? new Date(app.dob).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Gender</p>
                                <p className="font-medium text-slate-800 mt-1">{app.gender}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <p className="text-xs text-gray-400 uppercase font-bold">Address</p>
                                <p className="font-medium text-slate-800 mt-1">
                                    {app.address}, {app.city}, {app.state} - {app.pincode}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <ApplicationActions
                        applicationId={app.id}
                        currentStatus={app.status}
                        currentRemarks={app.remarks}
                    />
                </div>
            </div>
        </div>
    );
}
