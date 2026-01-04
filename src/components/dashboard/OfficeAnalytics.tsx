'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const feeCollection = [
    { name: 'Apr', collected: 450000, pending: 120000 },
    { name: 'May', collected: 520000, pending: 80000 },
    { name: 'Jun', collected: 380000, pending: 150000 },
    { name: 'Jul', collected: 620000, pending: 50000 },
];

const admissionStatus = [
    { name: 'Approved', value: 245 },
    { name: 'Pending', value: 58 },
    { name: 'Rejected', value: 12 },
];

const documentStatus = [
    { name: 'Verified', value: 320 },
    { name: 'Pending', value: 85 },
    { name: 'Missing', value: 25 },
];

const monthlyAdmissions = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 62 },
    { name: 'Mar', value: 85 },
    { name: 'Apr', value: 120 },
    { name: 'May', value: 95 },
    { name: 'Jun', value: 78 },
];

export function OfficeAnalytics() {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Fee Collection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">💰 Fee Collection Status (₹)</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={feeCollection}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000)}K`} />
                        <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 12 }} />
                        <Bar dataKey="collected" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Collected" />
                        <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
                        <Legend />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Admission Status */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">🎓 Admission Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={admissionStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                            {admissionStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Document Verification */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📋 Document Verification</h3>
                <div className="space-y-4">
                    {documentStatus.map((item, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{item.name}</span>
                                <span className="font-semibold">{item.value}</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${(item.value / 430) * 100}%`,
                                        backgroundColor: COLORS[i]
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Admissions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📈 Monthly Admissions</h3>
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={monthlyAdmissions}>
                        <defs>
                            <linearGradient id="colorAdm" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#colorAdm)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
