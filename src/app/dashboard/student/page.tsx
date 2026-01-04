import { getSession } from '../../../actions/auth';
import { Search, Bell, Monitor, Briefcase, Video, Box, PenTool, User, Settings } from 'lucide-react';
import { StudentNotificationsStatic } from '../../../components/dashboard/StudentNotifications';

export default async function StudentDashboard() {
    const session = await getSession();
    if (session?.role !== 'STUDENT') {
        return <div className="text-red-500 p-8">Access Denied. You are not a Student.</div>;
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Center Panel */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8">
                {/* Header / Search */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Welcome, {session.name}!</h1>
                        <p className="text-gray-500">Here's what's happening today</p>
                    </div>
                </div>

                {/* Events and Announcements */}
                <StudentNotificationsStatic />

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                    <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <span>•••</span> All
                        </div>
                    </button>
                    <button className="px-4 py-2 bg-white text-slate-600 border border-gray-100 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap hover:bg-gray-50">
                        <Monitor size={16} /> IT & Software
                    </button>
                    <button className="px-4 py-2 bg-white text-slate-600 border border-gray-100 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap hover:bg-gray-50">
                        <Video size={16} /> Media Training
                    </button>
                    <button className="px-4 py-2 bg-white text-slate-600 border border-gray-100 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap hover:bg-gray-50">
                        <Briefcase size={16} /> Business
                    </button>
                    <button className="px-4 py-2 bg-white text-slate-600 border border-gray-100 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap hover:bg-gray-50">
                        <Box size={16} /> Interior
                    </button>
                </div>

                {/* Most Popular Grid */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-700 mb-4">Most popular</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {/* Card 1 */}
                        <div className="bg-[#F8D9D9] p-6 rounded-3xl h-48 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-semibold">
                                    <Monitor size={12} /> IT & Software
                                </div>
                                <div className="bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">★ 4.8</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold leading-tight mb-1">CCNA 2020 200-125 Video Boot Camp</h3>
                                <p className="text-xs opacity-70">9,530 students</p>
                            </div>
                            {/* Avatars */}
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white"></div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#F8E8D4] p-6 rounded-3xl h-48 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-semibold">
                                    <Briefcase size={12} /> Business
                                </div>
                                <div className="bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">★ 4.9</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold leading-tight mb-1">Powerful Business Writing: How to Write Concisely</h3>
                                <p className="text-xs opacity-70">1,463 students</p>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#D9D9F8] p-6 rounded-3xl h-48 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-semibold">
                                    <Video size={12} /> Media Training
                                </div>
                                <div className="bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">★ 4.9</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold leading-tight mb-1">Certified Six Sigma Yellow Belt Training</h3>
                                <p className="text-xs opacity-70">6,726 students</p>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-[#D9F8E6] p-6 rounded-3xl h-48 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-semibold">
                                    <Box size={12} /> Interior
                                </div>
                                <div className="bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">★ 5.0</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold leading-tight mb-1">How to Design a Room in 10 Easy Steps</h3>
                                <p className="text-xs opacity-70">8,735 students</p>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-80 lg:w-96 bg-[#FDFBF6] lg:bg-[#FDFBF6] p-8 border-l border-orange-100/50 hidden xl:flex flex-col gap-8">
                {/* Profile Header */}
                <div className="flex justify-end gap-4">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <Bell size={20} className="text-gray-500" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <Settings size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-purple-200 mb-4 overflow-hidden relative">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.name}`} alt="Avatar" className="object-cover w-full h-full" />
                    </div>
                    <h3 className="text-xl font-bold">{session.name}</h3>
                    <p className="text-sm text-gray-500">{session.role}</p>
                </div>

                <div className="bg-[#FAEFE9] p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-full text-white">
                            <User size={16} />
                        </div>
                        <div className="text-sm font-semibold">274 Friends</div>
                    </div>
                    <div className="flex -space-x-1 pl-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 border border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-gray-400 border border-white flex items-center justify-center text-[10px]">+</div>
                    </div>
                </div>

                {/* Activity Chart Placeholder */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Activity</h3>
                        <select className="text-xs bg-transparent border-none outline-none font-semibold text-gray-500 cursor-pointer">
                            <option>Year</option>
                            <option>Month</option>
                        </select>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm h-48 flex flex-col justify-between">
                        <div className="text-2xl font-bold">3.5h <span className="text-xs font-normal text-amber-500 bg-amber-50 px-2 py-1 rounded-full ml-2">🔥 Great result!</span></div>
                        {/* Bars */}
                        <div className="flex justify-between items-end h-24 px-1">
                            {['Jan', 'Jan', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={`w-6 rounded-t-lg ${i === 6 ? 'bg-slate-800' : 'bg-purple-100'}`} style={{ height: `${Math.random() * 80 + 20}%` }}>
                                        {i === 6 && (
                                            <div className="w-full h-1/3 bg-purple-400 rounded-t-lg opacity-50"></div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400">{m}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* My Courses */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">My courses</h3>
                    </div>
                    <div className="bg-[#F8D9D9] p-4 rounded-2xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded text-[10px] font-bold">
                                <Monitor size={10} /> IT & Software
                            </div>
                            <div className="bg-white px-1.5 py-0.5 rounded text-[10px] font-bold">★ 4.8</div>
                        </div>
                        <h4 className="font-bold text-sm mb-1">Flutter Masterclass (Dart, APIs, Firebase & More)</h4>
                        <p className="text-[10px] opacity-70">9,530 students</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
