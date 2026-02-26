'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
    projects: number;
    posts: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ projects: 0, posts: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [projectsRes, postsRes] = await Promise.all([
                    fetch('/api/admin/projects'),
                    fetch('/api/admin/posts'),
                ]);
                const projects = await projectsRes.json();
                const posts = await postsRes.json();
                setStats({
                    projects: Array.isArray(projects) ? projects.length : 0,
                    posts: Array.isArray(posts) ? posts.length : 0,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="mb-10 pt-4">
                <h1 className="font-serif text-[28px] text-[#e5e5e0] font-normal tracking-tight">
                    Dashboard
                </h1>
                <p className="text-[13px] text-[#666] mt-1">
                    Welcome back, Uttam
                </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <Link
                    href="/admin/projects"
                    className="block p-6 bg-[#141414] border border-[#222] rounded-lg
                        hover:border-[#333] transition-all duration-200 no-underline group"
                >
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                        Work Projects
                    </p>
                    <p className="text-[36px] text-[#e5e5e0] font-serif tracking-tight">
                        {loading ? '—' : stats.projects}
                    </p>
                    <p className="text-[12px] text-[#444] mt-3 group-hover:text-[#666] transition-colors">
                        Manage projects →
                    </p>
                </Link>

                <Link
                    href="/admin/posts"
                    className="block p-6 bg-[#141414] border border-[#222] rounded-lg
                        hover:border-[#333] transition-all duration-200 no-underline group"
                >
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                        Writing Posts
                    </p>
                    <p className="text-[36px] text-[#e5e5e0] font-serif tracking-tight">
                        {loading ? '—' : stats.posts}
                    </p>
                    <p className="text-[12px] text-[#444] mt-3 group-hover:text-[#666] transition-colors">
                        Manage posts →
                    </p>
                </Link>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#555] mb-3">
                    Quick Actions
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/admin/projects?action=new"
                        className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                            text-[13px] text-[#888] no-underline hover:text-[#e5e5e0]
                            hover:border-[#333] transition-all duration-200"
                    >
                        + New Project
                    </Link>
                    <Link
                        href="/admin/posts?action=new"
                        className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                            text-[13px] text-[#888] no-underline hover:text-[#e5e5e0]
                            hover:border-[#333] transition-all duration-200"
                    >
                        + New Post
                    </Link>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                            text-[13px] text-[#888] no-underline hover:text-[#e5e5e0]
                            hover:border-[#333] transition-all duration-200"
                    >
                        View Site ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
