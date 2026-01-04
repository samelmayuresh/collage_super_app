'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

// Sample data
const enrollmentData = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 180 },
    { name: 'Mar', value: 150 },
    { name: 'Apr', value: 220 },
    { name: 'May', value: 280 },
    { name: 'Jun', value: 310 },
];

const departmentData = [
    { name: 'Engineering', value: 450 },
    { name: 'Science', value: 320 },
    { name: 'Commerce', value: 280 },
    { name: 'Arts', value: 180 },
    { name: 'Medical', value: 120 },
];

const attendanceData = [
    { name: 'Mon', present: 85, absent: 15 },
    { name: 'Tue', present: 90, absent: 10 },
    { name: 'Wed', present: 78, absent: 22 },
    { name: 'Thu', present: 92, absent: 8 },
    { name: 'Fri', present: 88, absent: 12 },
];

const feeCollectionData = [
    { name: 'Jan', value: 250000 },
    { name: 'Feb', value: 320000 },
    { name: 'Mar', value: 180000 },
    { name: 'Apr', value: 420000 },
    { name: 'May', value: 380000 },
    { name: 'Jun', value: 520000 },
];

export function AdminAnalytics() {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Enrollment Trend */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📈 Enrollment Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={enrollmentData}>
                        <defs>
                            <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorEnroll)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Department Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">🎓 Students by Department</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={departmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {departmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Attendance Overview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📊 Weekly Attendance (%)</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={attendanceData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                        <Bar dataKey="present" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                        <Bar dataKey="absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                        <Legend />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Fee Collection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">💰 Fee Collection (₹)</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={feeCollectionData}>
                        <defs>
                            <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} formatter={(v: any) => `₹${v.toLocaleString()}`} />
                        <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
