'use client';
import { useState } from 'react';

export function EventDescription({ text }: { text: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 150;

    if (!text) return null;
    if (text.length <= maxLength) return <p className="text-gray-500 text-sm mb-4">{text}</p>;

    return (
        <div className="mb-4">
            <p className="text-gray-500 text-sm">
                {isExpanded ? text : `${text.slice(0, maxLength)}...`}
            </p>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent card click if any
                    setIsExpanded(!isExpanded);
                }}
                className="text-violet-600 text-xs font-semibold hover:underline mt-1"
            >
                {isExpanded ? 'Show Less' : 'Read More'}
            </button>
        </div>
    );
}
