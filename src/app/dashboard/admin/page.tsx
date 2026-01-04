import { getSession } from '../../../actions/auth';
import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';
import { AdminAnalytics } from '../../../components/dashboard/AdminAnalytics';

export default async function AdminDashboard() {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
        return <div className="text-red-500 p-8">Access Denied. You are not an Admin.</div>;
    }

    return (
        <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {session.name}</p>
                </div>
                <div className="text-sm text-gray-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-violet-100 text-sm font-medium">Total Students</p>
                            <p className="text-4xl font-bold mt-2">2,847</p>
                            <p className="text-violet-200 text-sm mt-2">↑ 12% from last month</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Users size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-cyan-100 text-sm font-medium">Active Courses</p>
                            <p className="text-4xl font-bold mt-2">156</p>
                            <p className="text-cyan-200 text-sm mt-2">↑ 8 new this week</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <BookOpen size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Assignments</p>
                            <p className="text-4xl font-bold mt-2">1,024</p>
                            <p className="text-emerald-200 text-sm mt-2">342 pending review</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FileText size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Revenue</p>
                            <p className="text-4xl font-bold mt-2">₹4.2L</p>
                            <p className="text-orange-200 text-sm mt-2">↑ 23% growth</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <AdminAnalytics />

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-violet-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">New student registration</p>
                            <p className="text-sm text-gray-500">John Doe enrolled in Computer Science</p>
                        </div>
                        <span className="text-sm text-gray-400">2 min ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <FileText size={18} className="text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Assignment submitted</p>
                            <p className="text-sm text-gray-500">Physics Lab Report by Jane Smith</p>
                        </div>
                        <span className="text-sm text-gray-400">15 min ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">New course published</p>
                            <p className="text-sm text-gray-500">Advanced Mathematics by Prof. Kumar</p>
                        </div>
                        <span className="text-sm text-gray-400">1 hour ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
