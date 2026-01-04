import { getSession, getFullProfile } from '../../../actions/auth';
import { Calendar } from '../../../components/dashboard/Calendar';
import { Search, Bell, ChevronLeft, ChevronRight, User, Clock, FileText, CheckCircle, Search as SearchIcon } from 'lucide-react';
import { TeachingAnalytics } from '../../../components/dashboard/TeachingAnalytics';

export default async function TeachingDashboard() {
    const session = await getSession();
    const profileResult = await getFullProfile();
    const profileImage = profileResult.user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.name}`;

    return (
        <div className="flex-1 flex overflow-hidden bg-[#F5F7FA]">
            {/* Main Center Panel */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Header / Search */}
                <div className="flex items-center justify-between">
                    <div className="relative w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl text-gray-900 placeholder-gray-400 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            placeholder="Search"
                        />
                    </div>
                    <div className="text-gray-500 text-sm font-medium">12 May 2022, Friday</div>
                </div>

                {/* Welcome Banner */}
                <div className="bg-white rounded-3xl p-8 shadow-sm relative overflow-hidden flex items-center justify-between">
                    <div className="z-10 max-w-lg">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {session?.name || 'Teacher'}!</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            New French speaking classes are available.<br />
                            Étudier en France for B1 and B2 levels. <span className="text-red-400 cursor-pointer hover:underline">Learn more</span>
                        </p>
                        <button className="bg-[#7B8AB8] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6A79A6] transition-colors shadow-lg shadow-blue-100">
                            Buy Lesson
                        </button>
                    </div>
                    {/* Decorative Elements (Books 3D illustration placeholder) */}
                    <div className="hidden lg:block relative w-64 h-48">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                        {/* Abstract "Books" representation with CSS for now */}
                        <div className="absolute right-10 top-10 w-32 h-40 bg-blue-500 rounded-lg transform rotate-[-10deg] shadow-2xl z-0"></div>
                        <div className="absolute right-6 top-6 w-32 h-40 bg-indigo-500 rounded-lg transform rotate-[-5deg] shadow-xl z-10"></div>
                        <div className="absolute right-2 top-2 w-32 h-40 bg-white border-2 border-gray-100 rounded-lg shadow-lg z-20 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full mb-2"></div>
                            <div className="w-20 h-2 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Classes Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-700">Classes</h3>
                        <a href="#" className="text-sm text-gray-400 hover:text-black">View All &gt;</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Class Card 1 - Blue */}
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
                                <div className="flex items-center gap-2"><User size={14} /> Teacher: Leona Jimenez</div>
                            </div>
                        </div>

                        {/* Class Card 2 - Gradient */}
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
                                <div className="flex items-center gap-2"><User size={14} /> Teacher: Cole Chandler</div>
                            </div>
                        </div>

                        {/* Class Card 3 - Pink */}
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
                                <div className="flex items-center gap-2"><User size={14} /> Teacher: Cole Chandler</div>
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
                                    <th className="py-3 font-medium">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="py-4 font-bold text-slate-700">A1</td>
                                    <td className="py-4 text-gray-600">Bernard Carr</td>
                                    <td className="py-4">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 border border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center border border-white">3+</div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-600">12.07.2022</td>
                                    <td className="py-4 text-gray-500">Download</td>
                                    <td className="py-4"><span className="flex items-center gap-1 text-[#5672B1] font-bold"><div className="w-2 h-2 bg-[#5672B1] rounded-sm"></div> Done</span></td>
                                </tr>
                                <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="py-4 font-bold text-slate-700">A1</td>
                                    <td className="py-4 text-gray-600">Henry Poole</td>
                                    <td className="py-4">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 border border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center border border-white">7+</div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-600">17.07.2022</td>
                                    <td className="py-4 text-gray-500">Download</td>
                                    <td className="py-4"><span className="flex items-center gap-1 text-red-400 font-bold"><div className="w-2 h-2 bg-red-400 rounded-sm"></div> Pending</span></td>
                                </tr>
                                <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="py-4 font-bold text-slate-700">A1</td>
                                    <td className="py-4 text-gray-600">Helena Lowe</td>
                                    <td className="py-4">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 border border-white"></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-600">22.07.2022</td>
                                    <td className="py-4 text-gray-500">Download</td>
                                    <td className="py-4"><span className="flex items-center gap-1 text-[#5672B1] font-bold"><div className="w-2 h-2 bg-[#5672B1] rounded-sm"></div> Done</span></td>
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
                                <h5 className="font-bold text-sm text-slate-700">Eng - Vocabulary test</h5>
                                <p className="text-xs text-gray-400">12 Dec 2022, Friday</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="mt-1 p-2 bg-blue-50 text-blue-500 rounded-xl h-fit">
                                <Bell size={16} />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-slate-700">Eng - Essay</h5>
                                <p className="text-xs text-gray-400">12 Dec 2022, Friday</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="mt-1 p-2 bg-blue-50 text-blue-500 rounded-xl h-fit">
                                <Bell size={16} />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-slate-700">Eng - Speaking Class</h5>
                                <p className="text-xs text-gray-400">12 Dec 2022, Friday</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
