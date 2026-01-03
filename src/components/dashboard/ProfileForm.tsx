'use client';

import { useState, useEffect } from 'react';
import { updateProfile, updateProfileImage, getFullProfile } from '../../actions/auth';
import { CldUploadWidget } from 'next-cloudinary';
import { User, Lock, Mail, Save, Loader2, CheckCircle, AlertCircle, Camera } from 'lucide-react';

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
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const result = await getFullProfile();
        if (result.user?.profile_image) {
            setProfileImage(result.user.profile_image);
        }
    }

    async function handleImageUpload(result: any) {
        if (result.info?.secure_url) {
            setUploadingImage(true);
            const uploadResult = await updateProfileImage(result.info.secure_url);
            setUploadingImage(false);

            if (uploadResult.success) {
                setProfileImage(result.info.secure_url);
                setMessage({ type: 'success', text: 'Profile picture updated!' });
            } else {
                setMessage({ type: 'error', text: uploadResult.error || 'Failed to update image' });
            }
        }
    }

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

    const avatarUrl = profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture with Upload */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-blue-100 mb-4 overflow-hidden border-2 border-dashed border-blue-300">
                        {uploadingImage ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Loader2 className="animate-spin text-blue-500" size={24} />
                            </div>
                        ) : (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <CldUploadWidget
                        uploadPreset="TICKMAN"
                        onSuccess={handleImageUpload}
                        options={{
                            maxFiles: 1,
                            sources: ['local', 'camera'],
                            cropping: true,
                            croppingAspectRatio: 1,
                            showSkipCropButton: false,
                            resourceType: 'image',
                            folder: 'college_app/profiles'
                        }}
                    >
                        {({ open }) => (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="absolute bottom-2 right-0 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                            >
                                <Camera size={16} />
                            </button>
                        )}
                    </CldUploadWidget>
                </div>
                <p className="text-sm text-gray-500">Click camera icon to upload</p>
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
