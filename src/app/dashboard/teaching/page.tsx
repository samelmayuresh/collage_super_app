import { getSession, getFullProfile } from '../../../actions/auth';
import { Calendar } from '../../../components/dashboard/Calendar';
import { Search, Bell, ChevronLeft, ChevronRight, User, Clock, FileText, CheckCircle, Search as SearchIcon } from 'lucide-react';
import { TeachingAnalytics } from '../../../components/dashboard/TeachingAnalytics';
import { EventsManagementPanel } from '../../../components/dashboard/EventsManager';

export default async function TeachingDashboard() {
    const session = await getSession();
    const profileResult = await getFullProfile();
    const profileImage = profileResult.user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.name}`;

    if (!session || session.role !== 'TEACHING') {
        return <div className="text-red-500 p-8">Access Denied</div>;
    }

    return (
        <div className="flex bg-[#F5F7FA] min-h-screen">
            {/* Main Center Panel */}
            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                {/* Header / Search */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Hello, {session.name} 👋</h1>
                        <p className="text-gray-500">Here's what's happening in your classes today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <SearchIcon size={20} className="text-gray-400" />
                        </div>
                        <div className="bg-white p-2 rounded-full shadow-sm relative">
                            <Bell size={20} className="text-gray-400" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div>
                    </div>
                </div>

                {/* Welcome Banner */}
                <div className="bg-white rounded-3xl p-8 shadow-sm relative overflow-hidden flex items-center justify-between">
                    <div className="z-10 max-w-lg">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {session?.name || 'Teacher'}!</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Manage your classes, students, and curriculum efficiently.<br />
                            Check your upcoming schedule below.
                        </p>
                    </div>
                    {/* Decorative Elements */}
                    <div className="hidden lg:block relative w-64 h-48">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute right-10 top-10 w-32 h-40 bg-blue-500 rounded-lg transform rotate-[-10deg] shadow-2xl z-0"></div>
                        <div className="absolute right-6 top-6 w-32 h-40 bg-indigo-500 rounded-lg transform rotate-[-5deg] shadow-xl z-10"></div>
                        <div className="absolute right-2 top-2 w-32 h-40 bg-white border-2 border-gray-100 rounded-lg shadow-lg z-20 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full mb-2"></div>
                            <div className="w-20 h-2 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Management Panel */}
                <EventsManagementPanel userId={parseInt(session.userId || '0')} />

                {/* Classes Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-700">Classes</h3>
                        <a href="#" className="text-sm text-gray-400 hover:text-black">View All &gt;</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Class Card 1 */}
                        <div className="bg-[#5672B1] text-white p-6 rounded-3xl h-48 flex flex-col justify-between shadow-lg hover:-translate-y-1 transition-transform">
                            <div>
                                <h4 className="font-bold text-lg mb-1">English - UNIT III</h4>
                                <div className="flex -space-x-2 mt-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-[#5672B1]"></div>
                                    <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-[#5672B1]"></div>
                                    <div className="w-8 h-8 rounded-full bg-white text-[#5672B1] flex items-center justify-center text-xs font-bold border-2 border-[#5672B1]">+4</div>
                                </div>
                            </div>
                            <div className="text-sm opacity-80 space-y-1">
                                <div className="flex items-center gap-2"><FileText size={14} /> 10 Files</div>
                                <div className="flex items-center gap-2"><User size={14} /> Teacher: {session.name}</div>
                            </div>
                        </div>

                        {/* Class Card 2 */}
                        <div className="bg-gradient-to-br from-[#7B96D4] to-[#A2B6E6] text-white p-6 rounded-3xl h-48 flex flex-col justify-between shadow-lg hover:-translate-y-1 transition-transform">
                            <div>
                                <h4 className="font-bold text-lg mb-1">English - UNIT II</h4>
                                <div className="flex -space-x-2 mt-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-[#8CA5DE]"></div>
                                    <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-[#8CA5DE]"></div>
                                    <div className="w-8 h-8 rounded-full bg-white text-[#8CA5DE] flex items-center justify-center text-xs font-bold border-2 border-[#8CA5DE]">+2</div>
                                </div>
                            </div>
                            <div className="text-sm opacity-80 space-y-1">
                                <div className="flex items-center gap-2"><FileText size={14} /> 12 Files</div>
                                <div className="flex items-center gap-2"><User size={14} /> Teacher: {session.name}</div>
                            </div>
                        </div>

                        {/* Class Card 3 */}
                        <div className="bg-[#FCA5A5] bg-gradient-to-br from-[#FCA5A5] to-[#f8b4b4] text-white p-6 rounded-3xl h-48 flex flex-col justify-between shadow-lg hover:-translate-y-1 transition-transform">
                            <div>
                                <h4 className="font-bold text-lg mb-1">UNIT I</h4>
                                <div className="flex -space-x-2 mt-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-[#FCA5A5]"></div>
                                    <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-[#FCA5A5]"></div>
                                    <div className="w-8 h-8 rounded-full bg-white text-[#FCA5A5] flex items-center justify-center text-xs font-bold border-2 border-[#FCA5A5]">+4</div>
                                </div>
                            </div>
                            <div className="text-sm opacity-80 space-y-1">
                                <div className="flex items-center gap-2"><FileText size={14} /> 16 Files</div>
                                <div className="flex items-center gap-2"><User size={14} /> Teacher: {session.name}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lessons Table */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-700">Lessons</h3>
                        <a href="#" className="text-sm text-gray-400 hover:text-black">View All &gt;</a>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-gray-100">
                                    <th className="py-3 font-medium">Class</th>
                                    <th className="py-3 font-medium">Teacher Name</th>
                                    <th className="py-3 font-medium">Members</th>
                                    <th className="py-3 font-medium">Starting</th>
                                    <th className="py-3 font-medium">Material</th>
                                    <th className="py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="py-4 font-bold text-slate-700">A1</td>
                                    <td className="py-4 text-gray-600">{session.name}</td>
                                    <td className="py-4">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 border border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center border border-white">3+</div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-600">Today, 10:00 AM</td>
                                    <td className="py-4 text-gray-500">Download</td>
                                    <td className="py-4"><span className="flex items-center gap-1 text-[#5672B1] font-bold"><div className="w-2 h-2 bg-[#5672B1] rounded-sm"></div> Active</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Analytics Charts */}
                <TeachingAnalytics />
            </div>

            {/* Right Panel */}
            <div className="w-80 bg-white border-l border-gray-100 hidden xl:flex flex-col p-8 space-y-8">
                {/* Profile */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-blue-100 mb-4 overflow-hidden p-1 border-2 border-dashed border-blue-300">
                        <img src={profileImage} alt="Avatar" className="rounded-full w-full h-full object-cover bg-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{session?.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{session?.role}</p>
                    <button className="bg-[#7B8AB8] text-white px-8 py-2 rounded-xl font-medium shadow-md hover:bg-[#6A79A6] transition-colors">
                        Profile
                    </button>
                </div>

                {/* Calendar */}
                <Calendar />

                {/* Reminders */}
                <div>
                    <h4 className="font-bold text-slate-700 mb-4">Reminders</h4>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-1 p-2 bg-blue-50 text-blue-500 rounded-xl h-fit">
                                <Bell size={16} />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-slate-700">Submit Grades</h5>
                                <p className="text-xs text-gray-400">Due Today</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
