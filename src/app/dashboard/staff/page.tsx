import { getSession, getFullProfile } from '../../../actions/auth';
import { redirect } from 'next/navigation';
import { Building2, Layers, DoorOpen, MapPin, Users, ChevronLeft, ChevronRight, Bell, CheckCircle, Clock, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';

export default async function StaffDashboard() {
    const session = await getSession();

    if (!session || session.role !== 'STAFF') {
        redirect('/dashboard');
    }

    const profileResult = await getFullProfile();
    const profileImage = profileResult.user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.name}`;

    const cards = [
        { title: 'Buildings', icon: Building2, href: '/dashboard/staff/buildings', color: 'bg-blue-500', desc: 'Manage buildings' },
        { title: 'Floors', icon: Layers, href: '/dashboard/staff/floors', color: 'bg-green-500', desc: 'Configure floors & GPS' },
        { title: 'Classrooms', icon: DoorOpen, href: '/dashboard/staff/classrooms', color: 'bg-purple-500', desc: 'Assign rooms' },
    ];

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' });

    return (
        <div className="flex-1 flex overflow-hidden bg-[#F5F7FA]">
            {/* Main Center Panel */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                {/* Header / Search */}
                <div className="flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl text-gray-900 placeholder-gray-400 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            placeholder="Search buildings, floors..."
                        />
                    </div>
                    <div className="text-gray-500 text-sm font-medium hidden sm:block">{dateString}</div>
                </div>

                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                    <div className="z-10 relative">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome, {session?.name || 'Staff'}!</h2>
                        <p className="text-blue-100 mb-4 leading-relaxed max-w-lg">
                            Manage campus infrastructure. Set up buildings, floors, and GPS locations for the attendance system.
                        </p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2"></div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {cards.map((card) => (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
                            >
                                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    <card.icon size={24} />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                                <p className="text-gray-500 text-sm">{card.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Setup Guide */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Setup Guide
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                            <CheckCircle size={20} className="text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-800">Step 1: Create Buildings</p>
                                <p className="text-sm text-green-600">Add campus buildings (e.g., "Block A")</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                            <div className="w-5 h-5 rounded-full border-2 border-blue-400 mt-0.5"></div>
                            <div>
                                <p className="font-medium text-blue-800">Step 2: Add Floors</p>
                                <p className="text-sm text-blue-600">Create floors and set GPS coordinates</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5"></div>
                            <div>
                                <p className="font-medium text-gray-700">Step 3: Create Classrooms</p>
                                <p className="text-sm text-gray-500">Assign room numbers to floors</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Profile & Calendar */}
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

                {/* Calendar Placeholder */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
                        <h4 className="font-bold text-slate-700">January 2026</h4>
                        <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
                    </div>
                    <div className="bg-white rounded-2xl p-2">
                        <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-medium mb-2">
                            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                        </div>
                        <div className="grid grid-cols-7 text-center text-sm gap-y-2">
                            <div className="text-gray-300">30</div>
                            <div className="text-gray-300">31</div>
                            <div>1</div><div>2</div>
                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-md">3</div>
                            <div>4</div><div>5</div>
                            <div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div>
                            <div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div><div>19</div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h4 className="font-bold text-slate-700 mb-4">Recent Activity</h4>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-1 p-2 bg-green-50 text-green-500 rounded-xl h-fit">
                                <Building2 size={16} />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-slate-700">Building Added</h5>
                                <p className="text-xs text-gray-400">Main Campus Block A</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="mt-1 p-2 bg-blue-50 text-blue-500 rounded-xl h-fit">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-slate-700">GPS Location Set</h5>
                                <p className="text-xs text-gray-400">Floor 1 - Block A</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="mt-1 p-2 bg-purple-50 text-purple-500 rounded-xl h-fit">
                                <DoorOpen size={16} />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-slate-700">Classroom Created</h5>
                                <p className="text-xs text-gray-400">Room 101 - Floor 1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
