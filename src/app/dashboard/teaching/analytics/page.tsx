'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { getAttendanceAnalytics } from '../../../../actions/analytics';
import { getClasses } from '../../../../actions/classes';

interface AnalyticsData {
    totalSessions: number;
    completedSessions: number;
    totalRecords: number;
    dailyData: { date: string; count: number }[];
    classWiseData: { class_name: string; attendance_count: number }[];
}

export default function TeacherAnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedClass]);

    async function loadData() {
        setLoading(true);
        const [analyticsRes, classesRes] = await Promise.all([
            getAttendanceAnalytics(selectedClass ? { classId: parseInt(selectedClass) } : undefined),
            getClasses()
        ]);

        if (!analyticsRes.error) {
            setAnalytics(analyticsRes as AnalyticsData);
        }
        if (classesRes.classes) setClasses(classesRes.classes);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    const maxDaily = Math.max(...(analytics?.dailyData.map(d => d.count) || [1]));
    const maxClassWise = Math.max(...(analytics?.classWiseData.map(d => d.attendance_count) || [1]));

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Attendance Analytics</h1>
                        <p className="text-gray-500">Track attendance trends and statistics</p>
                    </div>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>
                        ))}
                    </select>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Calendar size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics?.totalSessions || 0}</p>
                                <p className="text-gray-500 text-sm">Total Sessions</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Users size={24} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics?.totalRecords || 0}</p>
                                <p className="text-gray-500 text-sm">Attendance Marked</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <TrendingUp size={24} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {analytics?.totalSessions ? Math.round((analytics.totalRecords / analytics.totalSessions)) : 0}
                                </p>
                                <p className="text-gray-500 text-sm">Avg per Session</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <BarChart3 size={24} className="text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics?.completedSessions || 0}</p>
                                <p className="text-gray-500 text-sm">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Trend */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-lg mb-4">Daily Attendance (Last 30 Days)</h2>
                        {analytics?.dailyData.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No data available</p>
                        ) : (
                            <div className="h-64 flex items-end gap-1">
                                {analytics?.dailyData.slice(-15).map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                            style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: '4px' }}
                                            title={`${new Date(d.date).toLocaleDateString()}: ${d.count}`}
                                        />
                                        <span className="text-xs text-gray-400 rotate-45 transform origin-left">
                                            {new Date(d.date).getDate()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Class-wise Breakdown */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-lg mb-4">Attendance by Class</h2>
                        {analytics?.classWiseData.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No class data available</p>
                        ) : (
                            <div className="space-y-4">
                                {analytics?.classWiseData.slice(0, 6).map((d, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium">{d.class_name}</span>
                                            <span className="text-gray-500">{d.attendance_count}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                style={{ width: `${(d.attendance_count / maxClassWise) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
