'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

interface ChartProps {
    title: string;
    data: { name: string; value: number }[];
    type?: 'bar' | 'pie' | 'line' | 'area';
    height?: number;
    color?: string;
}

export function AnalyticsChart({ title, data, type = 'bar', height = 250, color = '#8b5cf6' }: ChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                {type === 'bar' ? (
                    <BarChart data={data}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                ) : type === 'pie' ? (
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                ) : type === 'line' ? (
                    <LineChart data={data}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ fill: color }} />
                    </LineChart>
                ) : (
                    <AreaChart data={data}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}

// Stat Card with mini sparkline
interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'up' | 'down';
    icon?: React.ReactNode;
    trend?: number[];
}

export function StatCard({ title, value, change, changeType = 'up', icon, trend }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 font-medium">{title}</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 font-medium ${changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {changeType === 'up' ? '↑' : '↓'} {change}
                        </p>
                    )}
                </div>
                {icon && <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>}
            </div>
            {trend && trend.length > 0 && (
                <div className="mt-4 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trend.map((v, i) => ({ x: i, y: v }))}>
                            <Area type="monotone" dataKey="y" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

// Donut Chart for percentages
interface DonutChartProps {
    title: string;
    data: { name: string; value: number; color: string }[];
    centerValue?: string;
    centerLabel?: string;
}

export function DonutChart({ title, data, centerValue, centerLabel }: DonutChartProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">{title}</h3>
            <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                        >
                            {data.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                {centerValue && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{centerValue}</span>
                        {centerLabel && <span className="text-xs text-gray-500">{centerLabel}</span>}
                    </div>
                )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || COLORS[i] }} />
                        <span className="text-gray-600">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
