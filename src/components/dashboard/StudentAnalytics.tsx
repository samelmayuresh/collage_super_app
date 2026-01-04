'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const subjectGrades = [
    { name: 'Math', grade: 85 },
    { name: 'Physics', grade: 78 },
    { name: 'Chemistry', grade: 92 },
    { name: 'English', grade: 88 },
    { name: 'CS', grade: 95 },
];

const skillRadar = [
    { subject: 'Problem Solving', A: 85 },
    { subject: 'Creativity', A: 72 },
    { subject: 'Communication', A: 90 },
    { subject: 'Teamwork', A: 88 },
    { subject: 'Time Management', A: 75 },
    { subject: 'Leadership', A: 68 },
];

const progressData = [
    { month: 'Jan', score: 72 },
    { month: 'Feb', score: 75 },
    { month: 'Mar', score: 78 },
    { month: 'Apr', score: 82 },
    { month: 'May', score: 85 },
    { month: 'Jun', score: 88 },
];

const attendanceData = [
    { month: 'Jan', present: 22, absent: 2 },
    { month: 'Feb', present: 20, absent: 4 },
    { month: 'Mar', present: 23, absent: 1 },
    { month: 'Apr', present: 21, absent: 3 },
    { month: 'May', present: 24, absent: 0 },
];

export function StudentAnalytics() {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Subject Grades */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📚 Subject Grades</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={subjectGrades}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 12 }} />
                        <Bar dataKey="grade" radius={[6, 6, 0, 0]}>
                            {subjectGrades.map((entry, i) => (
                                <rect key={i} fill={entry.grade >= 90 ? '#10b981' : entry.grade >= 75 ? '#06b6d4' : '#f59e0b'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Skill Radar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">🎯 Skill Assessment</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={skillRadar}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                        <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Academic Progress */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📈 Academic Progress</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={progressData}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Attendance Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 mb-4">📅 Monthly Attendance</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={attendanceData}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
