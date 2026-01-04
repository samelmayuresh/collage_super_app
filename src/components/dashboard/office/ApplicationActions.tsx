'use client';
// Application actions component for office staff

import { useState, useTransition } from 'react';
import { updateApplicationStatus } from '@/actions/admission';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function ApplicationActions({ applicationId, currentStatus, currentRemarks }: { applicationId: number, currentStatus: string, currentRemarks?: string }) {
    const [remarks, setRemarks] = useState(currentRemarks || '');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleAction = async (status: string) => {
        if (!confirm(`Are you sure you want to ${status} this application?`)) return;

        startTransition(async () => {
            const result = await updateApplicationStatus(applicationId, status, remarks);
            if (result.success) {
                router.refresh();
            } else {
                alert('Failed to update status');
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="font-bold text-slate-800 mb-4">Take Action</h3>

            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Remarks / Notes</label>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 min-h-[100px]"
                    placeholder="Add comments here..."
                    disabled={isPending}
                ></textarea>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => handleAction('APPROVED')}
                    disabled={isPending || currentStatus === 'APPROVED'}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader className="animate-spin" size={18} /> : null}
                    Approve Application
                </button>

                <button
                    onClick={() => handleAction('REJECTED')}
                    disabled={isPending || currentStatus === 'REJECTED'}
                    className="w-full py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Reject Application
                </button>
            </div>
        </div>
    );
}
