'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '◆' },
    { href: '/admin/projects', label: 'Projects', icon: '□' },
    { href: '/admin/gallery', label: 'Gallery', icon: '◫' },
    { href: '/admin/posts', label: 'Posts', icon: '¶' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Don't show admin layout on login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-[#e5e5e0] flex">
            {/* Mobile sidebar toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-5 left-5 z-50 md:hidden text-[13px] uppercase tracking-[0.08em] text-[#888]
                    hover:text-[#e5e5e0] transition-colors"
            >
                {sidebarOpen ? 'Close' : 'Menu'}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed md:relative z-40 h-screen w-[220px] bg-[#141414] border-r border-[#222]
                    flex flex-col transition-transform duration-300 ease-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                {/* Logo area */}
                <div className="px-6 py-8 border-b border-[#222]">
                    <Link href="/" className="text-[15px] font-serif text-[#e5e5e0] no-underline hover:text-[#888] transition-colors">
                        ← Portfolio
                    </Link>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#555] mt-2">Admin Panel</p>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                    {adminLinks.map((link) => {
                        const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] no-underline
                                    transition-all duration-200
                                    ${isActive
                                        ? 'bg-[#1e1e1e] text-[#e5e5e0]'
                                        : 'text-[#888] hover:text-[#e5e5e0] hover:bg-[#1a1a1a]'
                                    }`}
                            >
                                <span className="text-[10px] opacity-60">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-[#222]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px]
                            text-[#666] hover:text-[#e5e5e0] hover:bg-[#1a1a1a] transition-all duration-200"
                    >
                        <span className="text-[10px] opacity-60">↗</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="flex-1 min-h-screen overflow-auto">
                <div className="max-w-[960px] mx-auto px-6 md:px-10 py-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
