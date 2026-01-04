'use client';

import { useState, useEffect } from 'react';
import { getFullProfile } from '../../actions/auth';
import { Mail, User as UserIcon } from 'lucide-react';

interface UserInfo {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image?: string;
}

interface UserCardProps {
    accentColor?: string; // tailwind color class like 'orange', 'blue', 'green', 'indigo', 'purple'
}

const colorSchemes: Record<string, { bg: string; badge: string; badgeText: string; iconBg: string }> = {
    orange: { bg: 'from-orange-50 to-amber-50', badge: 'bg-orange-100', badgeText: 'text-orange-700', iconBg: 'text-orange-400' },
    blue: { bg: 'from-blue-50 to-cyan-50', badge: 'bg-blue-100', badgeText: 'text-blue-700', iconBg: 'text-blue-400' },
    green: { bg: 'from-green-50 to-emerald-50', badge: 'bg-green-100', badgeText: 'text-green-700', iconBg: 'text-green-400' },
    indigo: { bg: 'from-indigo-50 to-violet-50', badge: 'bg-indigo-100', badgeText: 'text-indigo-700', iconBg: 'text-indigo-400' },
    purple: { bg: 'from-purple-50 to-fuchsia-50', badge: 'bg-purple-100', badgeText: 'text-purple-700', iconBg: 'text-purple-400' },
};

export function UserCard({ accentColor = 'orange' }: UserCardProps) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const colors = colorSchemes[accentColor] || colorSchemes.orange;

    useEffect(() => {
        async function loadUser() {
            const result = await getFullProfile();
            if (result.user) {
                setUser(result.user);
            }
            setLoading(false);
        }
        loadUser();
    }, []);

    if (loading) {
        return (
            <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-4 animate-pulse border border-gray-100`}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const avatarUrl = user.profile_image ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

    return (
        <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{user.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                        <Mail size={12} className={colors.iconBg} />
                        <span className="truncate">{user.email}</span>
                    </div>
                </div>
            </div>

            {/* Role Badge */}
            <div className="mt-3 flex items-center justify-between">
                <span className={`px-2 py-1 ${colors.badge} ${colors.badgeText} rounded-full text-[10px] font-bold uppercase tracking-wide`}>
                    {user.role}
                </span>
                <span className="text-[10px] text-gray-400">ID: #{user.id.toString().padStart(5, '0')}</span>
            </div>
        </div>
    );
}
