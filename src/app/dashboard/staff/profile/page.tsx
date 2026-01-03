import { getSession } from '../../../../actions/auth';
import { redirect } from 'next/navigation';
import { ProfileForm } from '../../../../components/dashboard/ProfileForm';
import { User } from 'lucide-react';

export default async function StaffProfilePage() {
    const session = await getSession();

    if (!session || session.role !== 'STAFF') {
        redirect('/dashboard');
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                        <User size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Profile</h1>
                        <p className="text-gray-500 text-sm">Update your personal information</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                    <ProfileForm user={{ name: session.name, email: session.email, role: session.role }} />
                </div>
            </div>
        </div>
    );
}
