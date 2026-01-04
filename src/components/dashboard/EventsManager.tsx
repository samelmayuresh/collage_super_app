'use client';

import { useState } from 'react';
import { Plus, Calendar, Megaphone, X, Save, MapPin, Clock, Users } from 'lucide-react';

interface EventFormData {
    title: string;
    description: string;
    event_type: string;
    start_date: string;
    end_date: string;
    location: string;
    is_mandatory: boolean;
    target_roles: string[];
}

interface AnnouncementFormData {
    title: string;
    content: string;
    priority: string;
    target_roles: string[];
    is_pinned: boolean;
    expires_at: string;
}

export function EventCreator({ userId, onCreated }: { userId: number; onCreated?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<EventFormData>({
        title: '',
        description: '',
        event_type: 'general',
        start_date: '',
        end_date: '',
        location: '',
        is_mandatory: false,
        target_roles: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, created_by: userId })
            });
            if (res.ok) {
                setIsOpen(false);
                setForm({ title: '', description: '', event_type: 'general', start_date: '', end_date: '', location: '', is_mandatory: false, target_roles: [] });
                onCreated?.();
                alert('Event created successfully!');
            } else {
                const err = await res.json();
                alert(`Failed to create event: ${err.error || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error('Error creating event:', error);
            alert(`Error: ${error.message}`);
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-violet-700 transition-colors"
            >
                <Plus size={18} /> Create Event
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Calendar className="text-violet-500" /> Create Event
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500 resize-none h-24"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={form.event_type}
                                        onChange={e => setForm({ ...form, event_type: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="general">General</option>
                                        <option value="academic">Academic</option>
                                        <option value="sports">Sports</option>
                                        <option value="cultural">Cultural</option>
                                        <option value="workshop">Workshop</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500"
                                        placeholder="e.g., Main Hall"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.start_date}
                                        onChange={e => setForm({ ...form, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={form.end_date}
                                        onChange={e => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_mandatory}
                                        onChange={e => setForm({ ...form, is_mandatory: e.target.checked })}
                                        className="w-4 h-4 rounded text-violet-600"
                                    />
                                    <span className="text-sm font-medium">Mandatory Event</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-3 border-2 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> {loading ? 'Creating...' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export function AnnouncementCreator({ userId, onCreated }: { userId: number; onCreated?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<AnnouncementFormData>({
        title: '',
        content: '',
        priority: 'normal',
        target_roles: [],
        is_pinned: false,
        expires_at: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, created_by: userId })
            });
            if (res.ok) {
                setIsOpen(false);
                setForm({ title: '', content: '', priority: 'normal', target_roles: [], is_pinned: false, expires_at: '' });
                onCreated?.();
                alert('Announcement created successfully!');
            } else {
                const err = await res.json();
                alert(`Failed to create announcement: ${err.error || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error('Error creating announcement:', error);
            alert(`Error: ${error.message}`);
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
                <Plus size={18} /> Create Announcement
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Megaphone className="text-blue-500" /> Create Announcement
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none h-32"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={e => setForm({ ...form, priority: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                                    <input
                                        type="datetime-local"
                                        value={form.expires_at}
                                        onChange={e => setForm({ ...form, expires_at: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_pinned}
                                        onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-600"
                                    />
                                    <span className="text-sm font-medium">📌 Pin Announcement</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-3 border-2 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> {loading ? 'Publishing...' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// Combined panel for Admin/Teacher dashboards
export function EventsManagementPanel({ userId }: { userId: number }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📢 Manage Communications</h3>
            <div className="flex flex-wrap gap-3">
                <EventCreator userId={userId} />
                <AnnouncementCreator userId={userId} />
            </div>
        </div>
    );
}
