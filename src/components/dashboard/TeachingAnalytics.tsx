'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const classPerformance = [
    { name: 'Class 10-A', avg: 85 },
    { name: 'Class 10-B', avg: 78 },
    { name: 'Class 11-A', avg: 92 },
    { name: 'Class 11-B', avg: 74 },
    { name: 'Class 12-A', avg: 88 },
];

const subjectDistribution = [
    { name: 'Math', value: 45 },
    { name: 'Science', value: 38 },
    { name: 'English', value: 52 },
    { name: 'History', value: 28 },
];

const weeklyAttendance = [
    { name: 'Mon', value: 92 },
    { name: 'Tue', value: 88 },
    { name: 'Wed', value: 95 },
    { name: 'Thu', value: 85 },
    { name: 'Fri', value: 78 },
];

const assignmentProgress = [
    { name: 'Assigned', value: 45 },
    { name: 'Submitted', value: 38 },
    { name: 'Graded', value: 32 },
];

export function TeachingAnalytics() {
    return (
        <div className="grid gap-6 lg:grid-cols-2 mt-8">
            {/* Class Performance */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📊 Class Performance (Avg %)</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={classPerformance} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                        <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                            {classPerformance.map((entry, i) => (
                                <Cell key={i} fill={entry.avg >= 85 ? '#10b981' : entry.avg >= 75 ? '#f59e0b' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Subject Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📚 Assignments by Subject</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={subjectDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                            {subjectDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Weekly Attendance */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📅 Weekly Class Attendance (%)</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weeklyAttendance}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Assignment Progress */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">✅ Assignment Status</h3>
                <div className="flex items-center justify-around h-[180px]">
                    {assignmentProgress.map((item, i) => (
                        <div key={i} className="text-center">
                            <div className="relative w-20 h-20 mx-auto">
                                <svg className="w-20 h-20 transform -rotate-90">
                                    <circle cx="40" cy="40" r="35" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="40" cy="40" r="35"
                                        stroke={COLORS[i]}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(item.value / 50) * 220} 220`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{item.value}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{item.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
