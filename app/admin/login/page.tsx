'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/admin/dashboard';
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push(redirect);
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid password');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[360px]">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="font-serif text-[28px] text-[#e5e5e0] font-normal tracking-tight">
                    Admin
                </h1>
                <p className="text-[13px] text-[#666] mt-2 tracking-wide">
                    Enter your password to continue
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        autoFocus
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                            text-[15px] text-[#e5e5e0] placeholder-[#555]
                            outline-none focus:border-[#444] transition-colors duration-200"
                    />
                </div>

                {error && (
                    <p className="text-[13px] text-[#e34040]">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full py-3 bg-[#e5e5e0] text-[#0e0e0e] rounded-md text-[14px]
                        font-medium tracking-wide transition-all duration-200
                        hover:bg-[#d5d5d0] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            {/* Back link */}
            <div className="mt-8 text-center">
                <a
                    href="/"
                    className="text-[12px] text-[#555] no-underline hover:text-[#888] transition-colors uppercase tracking-[0.1em]"
                >
                    ← Back to site
                </a>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-6">
            <Suspense fallback={<div className="text-[#555] text-[13px]">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
