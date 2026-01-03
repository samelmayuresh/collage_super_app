import { getSession } from '../../../actions/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
        return <div className="text-red-500">Access Denied. You are not an Admin.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-500">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">1,234</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-500">Active Sessions</h3>
                    <p className="text-3xl font-bold mt-2">56</p>
                </div>
                {/* Add more stats */}
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <p>No recent activity.</p>
            </div>
        </div>
    );
}
