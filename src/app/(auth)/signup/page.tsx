'use client';

import { useState, useTransition } from 'react';
import { signup } from '../../../actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader } from '../../../components/ui/Loader';

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Show loader IMMEDIATELY
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await signup(formData);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            // Keep loader showing during navigation
            startTransition(() => {
                router.push('/signin');
                router.refresh();
            });
        }
    }

    // Show loader during form submission OR navigation
    const showLoader = isLoading || isPending;

    if (showLoader) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FDFBF6]">
                <div className="flex flex-col items-center gap-4">
                    <Loader />
                    <p className="text-[#DAA06D] font-medium animate-pulse">
                        {isPending ? 'Redirecting...' : 'Creating account...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FDFBF6] px-4">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 pt-12 px-6 sm:px-10 pb-8 border-2 border-dashed border-[#DAA06D] rounded-2xl bg-[#EADDCA] shadow-[0_0_0_4px_#EADDCA,2px_2px_4px_2px_rgba(0,0,0,0.5)] transition-all duration-400 w-full max-w-sm"
            >
                <p className="text-[#DAA06D] text-center tracking-[0.3em] sm:tracking-[0.5em] pt-4 pb-8 sm:pb-12 text-lg sm:text-xl font-bold">
                    SIGN UP
                </p>

                <input
                    placeholder="Name"
                    name="name"
                    type="text"
                    required
                    className="outline-none p-2 border border-[#DAA06D] text-[#DAA06D] w-full h-12 rounded-xl bg-[#EADDCA] text-center placeholder:text-[#DAA06D]"
                />

                <input
                    placeholder="Email"
                    name="email"
                    type="email"
                    required
                    className="outline-none p-2 border border-[#DAA06D] text-[#DAA06D] w-full h-12 rounded-xl bg-[#EADDCA] text-center placeholder:text-[#DAA06D]"
                />

                <input
                    placeholder="Password"
                    name="password"
                    type="password"
                    required
                    className="outline-none p-2 border border-[#DAA06D] text-[#DAA06D] w-full h-12 rounded-xl bg-[#EADDCA] text-center placeholder:text-[#DAA06D]"
                />

                <select
                    name="role"
                    required
                    className="outline-none p-2 border border-[#DAA06D] text-[#DAA06D] w-full h-12 rounded-xl bg-[#EADDCA] text-center cursor-pointer appearance-none"
                >
                    <option value="STAFF">Staff</option>
                    <option value="TEACHING">Teaching</option>
                    <option value="STUDENT">Student</option>
                </select>

                {error && (
                    <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={showLoader}
                    className="self-center mt-8 rounded-xl outline-none border-none text-white bg-[#E5AA70] font-bold tracking-[0.1em] transition-all duration-400 p-4 shadow-[0.5px_0.5px_0.5px_0.5px_rgba(0,0,0,0.5)] hover:opacity-80 active:translate-x-[0.1em] active:translate-y-[0.1em] active:shadow-none disabled:opacity-50"
                >
                    Submit
                </button>

                <p className="mt-4 text-center text-sm text-[#DAA06D]">
                    Already have an account?{' '}
                    <Link className="font-bold hover:underline" href="/signin">
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    );
}
