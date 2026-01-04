'use client';

import { useState, useTransition } from 'react';
import { registerApplicant } from '../../../actions/admission';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader } from '../../../components/ui/Loader';

// List of available courses
const COURSES = [
    'Computer Science & Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Biotechnology',
    'Business Administration (BBA)',
    'Commerce (B.Com)',
    'Arts (BA)'
];

// List of available branches
const ADMISSION_CATEGORIES = [
    { id: 'FY', name: 'First Year (FY)' },
    { id: 'DSY', name: 'Direct Second Year (DSY)' }
];

// List of available branches
const BRANCHES = [
    { id: 'CS', name: 'Computer Science' },
    { id: 'IT', name: 'Information Technology' },
    { id: 'EXTC', name: 'Electronics & Telecom' },
    { id: 'MECH', name: 'Mechanical Engineering' },
    { id: 'CIVIL', name: 'Civil Engineering' },
    { id: 'AI', name: 'Artificial Intelligence' },
];

export default function AdmissionRegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await registerApplicant(formData);
            if (result.error) {
                setError(result.error);
            } else {
                router.replace('/dashboard');
            }
        });
    }

    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FDFBF6]">
                <div className="flex flex-col items-center gap-4">
                    <Loader />
                    <p className="text-[#DAA06D] font-medium animate-pulse">
                        Submitting Application...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF6] py-12 px-4 sm:px-6 lg:px-8 relative">
            <Link href="/" className="absolute top-6 left-6 text-[#DAA06D] hover:text-[#5d4037] transition-colors p-2 rounded-full hover:bg-[#EADDCA]/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            </Link>

            <div className="max-w-3xl mx-auto">
                <div className="bg-[#EADDCA] border-2 border-dashed border-[#DAA06D] rounded-2xl shadow-[0_0_0_4px_#EADDCA,2px_2px_4px_2px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="px-6 py-8 sm:p-10">
                        <div className="text-center mb-10">
                            <h2 className="text-[#DAA06D] tracking-[0.3em] sm:tracking-[0.5em] text-2xl font-bold uppercase">
                                New Enrollment
                            </h2>
                            <p className="mt-2 text-[#b07b4b] text-sm font-medium tracking-wide">
                                Join our academic community
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Details */}
                            <div>
                                <h3 className="text-[#DAA06D] font-bold uppercase tracking-widest text-xs border-b border-[#DAA06D]/30 pb-2 mb-4">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Full Name</label>
                                        <input name="fullName" type="text" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Date of Birth</label>
                                        <input name="dob" type="date" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Gender</label>
                                        <select name="gender" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm cursor-pointer appearance-none">
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div>
                                <h3 className="text-[#DAA06D] font-bold uppercase tracking-widest text-xs border-b border-[#DAA06D]/30 pb-2 mb-4">
                                    Contact Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Email</label>
                                        <input name="email" type="email" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" placeholder="john@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Phone Number</label>
                                        <input name="phone" type="tel" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" placeholder="+91 9876543210" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Address</label>
                                        <textarea name="address" rows={3} className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">City</label>
                                        <input name="city" type="text" className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">State</label>
                                            <input name="state" type="text" className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Pincode</label>
                                            <input name="pincode" type="text" className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Details */}
                            <div>
                                <h3 className="text-[#DAA06D] font-bold uppercase tracking-widest text-xs border-b border-[#DAA06D]/30 pb-2 mb-4">
                                    Academic Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">10th Marks (%)</label>
                                        <input name="tenthMarks" type="number" step="0.01" max="100" className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">12th Marks (%)</label>
                                        <input name="twelfthMarks" type="number" step="0.01" max="100" className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Preferred Course</label>
                                        <select name="preferredCourse" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm cursor-pointer appearance-none">
                                            <option value="">Select Course</option>
                                            {COURSES.map(course => (
                                                <option key={course} value={course}>{course}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Admission Type</label>
                                        <select name="admissionCategory" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm cursor-pointer appearance-none">
                                            <option value="">Select Admission Type</option>
                                            {ADMISSION_CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Branch</label>
                                        <select name="branch" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm cursor-pointer appearance-none">
                                            <option value="">Select Branch</option>
                                            {BRANCHES.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Account Security */}
                            <div>
                                <h3 className="text-[#DAA06D] font-bold uppercase tracking-widest text-xs border-b border-[#DAA06D]/30 pb-2 mb-4">
                                    Account Security
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-[#b07b4b] uppercase tracking-wide mb-1">Create Password</label>
                                    <input name="password" type="password" required className="w-full bg-[#FDFBF6] border border-[#DAA06D] rounded-xl px-4 py-3 outline-none text-[#5d4037] placeholder-[#DAA06D]/50 focus:ring-2 focus:ring-[#DAA06D]/50 transition-all shadow-sm" placeholder="Minimum 6 characters" />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full rounded-xl outline-none border-none text-white bg-[#E5AA70] font-bold tracking-[0.1em] transition-all duration-400 p-4 shadow-[0.5px_0.5px_0.5px_0.5px_rgba(0,0,0,0.5)] hover:opacity-80 active:translate-x-[0.1em] active:translate-y-[0.1em] active:shadow-none disabled:opacity-50 uppercase text-lg"
                                >
                                    Submit Application
                                </button>
                                <p className="mt-4 text-center text-sm text-[#DAA06D]">
                                    Already registered?{' '}
                                    <Link className="font-bold hover:underline" href="/signin">
                                        Log In
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
