'use client';

import { useState } from 'react';
import { updateProfile } from '../../actions/auth';
import { User, Lock, Mail, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileFormProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [name, setName] = useState(user.name);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        if (currentPassword && newPassword) {
            formData.append('currentPassword', currentPassword);
            formData.append('newPassword', newPassword);
        }

        const result = await updateProfile(formData);
        setLoading(false);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-blue-100 mb-4 overflow-hidden p-1 border-2 border-dashed border-blue-300">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        alt="Avatar"
                        className="rounded-full w-full h-full object-cover bg-white"
                    />
                </div>
                <p className="text-sm text-gray-500">Avatar based on your name</p>
            </div>

            {/* Name Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={14} className="inline mr-1" /> Full Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                    placeholder="Your name"
                />
            </div>

            {/* Email (Read-only) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={14} className="inline mr-1" /> Email
                </label>
                <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Role (Read-only) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                </label>
                <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {user.role}
                    </span>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Lock size={16} /> Change Password
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                            placeholder="Enter current password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-2 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Save Changes
            </button>
        </form>
    );
}
