'use client';

import { LucideIcon, Construction } from 'lucide-react';
import Link from 'next/link';

interface PlaceholderPageProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon = Construction }: PlaceholderPageProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Icon size={40} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="max-w-md mb-8">{description || "This page is currently under construction. Please check back later."}</p>
            <Link
                href=".."
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
                Go Back
            </Link>
        </div>
    );
}
