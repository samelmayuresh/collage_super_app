'use client';

import { useState, useEffect } from 'react';
import { Bell, Calendar, Megaphone, AlertTriangle, X, ChevronRight, Clock, MapPin, CheckCircle } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string;
    event_type: string;
    start_date: string;
    location: string;
    is_mandatory: boolean;
    images?: string[];
    links?: { title: string; url: string }[];
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    priority: string;
    is_pinned: boolean;
    created_at: string;
}

interface Alert {
    id: number;
    alert_type: string;
    title: string;
    message: string;
    severity: string;
    is_read: boolean;
    action_url: string;
    created_at: string;
}

const eventTypeColors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-700',
    academic: 'bg-blue-100 text-blue-700',
    sports: 'bg-green-100 text-green-700',
    cultural: 'bg-purple-100 text-purple-700',
    workshop: 'bg-orange-100 text-orange-700',
};

const priorityColors: Record<string, string> = {
    low: 'border-l-gray-400',
    normal: 'border-l-blue-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500',
};

const severityStyles: Record<string, { bg: string; icon: string; border: string }> = {
    info: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-200' },
    warning: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-200' },
    danger: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-200' },
};

export function EventsCard({ events }: { events: Event[] }) {
    if (!events?.length) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-violet-500" size={20} /> Upcoming Events
                </h3>
                <a href="/dashboard/events" className="text-sm text-violet-600 hover:underline flex items-center">
                    View All <ChevronRight size={14} />
                </a>
            </div>
            <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="w-full">
                                {event.images && event.images.length > 0 && (
                                    <div className="h-32 mb-3 rounded-lg overflow-hidden w-full bg-gray-200">
                                        <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${eventTypeColors[event.event_type] || eventTypeColors.general}`}>
                                        {event.event_type}
                                    </span>
                                    {event.is_mandatory && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Required</span>
                                    )}
                                </div>
                                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{event.description?.slice(0, 80)}...</p>

                                {event.links && event.links.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {event.links.map((link, i) => (
                                            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="text-xs bg-white text-violet-600 border border-violet-200 px-2 py-1 rounded hover:bg-violet-50 truncate max-w-[150px]">
                                                {link.title} 🔗
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {event.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {event.location}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AnnouncementsCard({ announcements }: { announcements: Announcement[] }) {
    if (!announcements?.length) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Megaphone className="text-blue-500" size={20} /> Announcements
                </h3>
            </div>
            <div className="space-y-3">
                {announcements.slice(0, 4).map((a) => (
                    <div key={a.id} className={`p-4 rounded-xl bg-gray-50 border-l-4 ${priorityColors[a.priority] || priorityColors.normal}`}>
                        <div className="flex items-start gap-2">
                            {a.is_pinned && <span className="text-amber-500">📌</span>}
                            <div>
                                <h4 className="font-semibold text-gray-800">{a.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{a.content.slice(0, 100)}...</p>
                                <span className="text-xs text-gray-400 mt-2 block">
                                    {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AlertsPanel({ alerts, onMarkRead }: { alerts: Alert[]; onMarkRead?: (id: number) => void }) {
    const [dismissed, setDismissed] = useState<number[]>([]);

    const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id) && !a.is_read);

    if (!visibleAlerts.length) return null;

    const handleDismiss = (id: number) => {
        setDismissed([...dismissed, id]);
        onMarkRead?.(id);
    };

    return (
        <div className="space-y-3 mb-6">
            {visibleAlerts.slice(0, 3).map((alert) => {
                const style = severityStyles[alert.severity] || severityStyles.warning;
                return (
                    <div key={alert.id} className={`p-4 rounded-xl ${style.bg} border ${style.border} flex items-start gap-3`}>
                        <AlertTriangle className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            {alert.action_url && (
                                <a href={alert.action_url} className="text-sm text-violet-600 hover:underline mt-2 inline-block">
                                    Take Action →
                                </a>
                            )}
                        </div>
                        <button
                            onClick={() => handleDismiss(alert.id)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// Bell icon with notification count for headers
export function AlertBell({ count, onClick }: { count: number; onClick?: () => void }) {
    return (
        <button onClick={onClick} className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </button>
    );
}

// Low Attendance Warning Banner
export function AttendanceWarning({ percentage }: { percentage: number }) {
    if (percentage >= 75) return null;

    const severity = percentage < 60 ? 'danger' : 'warning';
    const style = severityStyles[severity];

    return (
        <div className={`${style.bg} border ${style.border} rounded-2xl p-5 mb-6`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${severity === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <AlertTriangle className={style.icon} size={28} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                        {severity === 'danger' ? '🚨 Critical: Low Attendance!' : '⚠️ Attendance Warning'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Your current attendance is <strong>{percentage.toFixed(1)}%</strong>.
                        {severity === 'danger'
                            ? ' This is critically low and may affect your eligibility for exams.'
                            : ' You need at least 75% attendance. Please attend classes regularly.'}
                    </p>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-bold ${severity === 'danger' ? 'text-red-600' : 'text-amber-600'}`}>
                        {percentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">attendance</div>
                </div>
            </div>
        </div>
    );
}
