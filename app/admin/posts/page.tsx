'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false });
const MarkdownPreview = dynamic(() => import('@/components/admin/MarkdownPreview'), { ssr: false });

interface Post {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    cover: string;
    content: string;
}

const emptyPost: Post = {
    slug: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    excerpt: '',
    cover: '',
    content: '',
};

function PostsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get('action');
    const editSlug = searchParams.get('edit');

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState<Post>(emptyPost);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState('');
    const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        if (action === 'new') {
            setFormData({ ...emptyPost });
            setIsEditing(false);
            setShowForm(true);
        } else if (editSlug) {
            const post = posts.find((p) => p.slug === editSlug);
            if (post) {
                setFormData({ ...post });
                setIsEditing(true);
                setShowForm(true);
            }
        }
    }, [action, editSlug, posts]);

    async function fetchPosts() {
        try {
            const res = await fetch('/api/admin/posts');
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/posts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage(isEditing ? 'Post updated!' : 'Post created!');
                setShowForm(false);
                setFormData({ ...emptyPost });
                router.replace('/admin/posts');
                await fetchPosts();
            } else {
                const data = await res.json();
                setMessage(data.error || 'Error saving post');
            }
        } catch {
            setMessage('Error saving post');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(slug: string) {
        if (!confirm(`Delete post "${slug}"? This cannot be undone.`)) return;
        setDeleting(slug);

        try {
            const res = await fetch(`/api/admin/posts?slug=${slug}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await fetchPosts();
                setMessage('Post deleted');
            } else {
                setMessage('Error deleting post');
            }
        } catch {
            setMessage('Error deleting post');
        } finally {
            setDeleting(null);
        }
    }

    function handleCancel() {
        setShowForm(false);
        setFormData({ ...emptyPost });
        router.replace('/admin/posts');
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'writing');

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: fd,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData((prev) => ({ ...prev, cover: data.path }));
            } else {
                setMessage('Error uploading image');
            }
        } catch {
            setMessage('Error uploading image');
        } finally {
            setUploadingImage(false);
        }
    }

    // Form view
    if (showForm) {
        return (
            <div>
                <div className="flex items-center justify-between mb-6 pt-4">
                    <h1 className="font-serif text-[28px] text-[#e5e5e0] font-normal tracking-tight">
                        {isEditing ? 'Edit Post' : 'New Post'}
                    </h1>
                    <div className="flex items-center gap-3">
                        {/* View mode toggle */}
                        <div className="flex bg-[#1a1a1a] border border-[#2a2a2a] rounded-md overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setViewMode('editor')}
                                className={`px-3 py-1.5 text-[11px] transition-all ${viewMode === 'editor'
                                        ? 'bg-[#2a2a2a] text-[#e5e5e0]'
                                        : 'text-[#666] hover:text-[#e5e5e0]'
                                    }`}
                            >
                                Editor
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('split')}
                                className={`px-3 py-1.5 text-[11px] transition-all ${viewMode === 'split'
                                        ? 'bg-[#2a2a2a] text-[#e5e5e0]'
                                        : 'text-[#666] hover:text-[#e5e5e0]'
                                    }`}
                            >
                                Split
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('preview')}
                                className={`px-3 py-1.5 text-[11px] transition-all ${viewMode === 'preview'
                                        ? 'bg-[#2a2a2a] text-[#e5e5e0]'
                                        : 'text-[#666] hover:text-[#e5e5e0]'
                                    }`}
                            >
                                Preview
                            </button>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-[13px] text-[#666] hover:text-[#e5e5e0] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Top fields - always visible */}
                    <div className={viewMode === 'preview' ? 'hidden' : ''}>
                        {/* Slug */}
                        <div className="mb-4">
                            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                Slug {isEditing && <span className="text-[#444]">(cannot change)</span>}
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                                    }))
                                }
                                disabled={isEditing}
                                placeholder="my-post-title"
                                required
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                    text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none
                                    focus:border-[#444] transition-colors disabled:opacity-50"
                            />
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Post Title"
                                required
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                    text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none
                                    focus:border-[#444] transition-colors"
                            />
                        </div>

                        {/* Date + Excerpt row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                        text-[15px] text-[#e5e5e0] outline-none
                                        focus:border-[#444] transition-colors [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                    Excerpt
                                </label>
                                <input
                                    type="text"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                                    placeholder="A brief summary..."
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                        text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none
                                        focus:border-[#444] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div className="mb-4">
                            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                Cover Image
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={formData.cover}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, cover: e.target.value }))
                                    }
                                    placeholder="/writing/cover.jpg or https://..."
                                    className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                        text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none
                                        focus:border-[#444] transition-colors"
                                />
                                <label className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                    text-[13px] text-[#888] cursor-pointer hover:text-[#e5e5e0]
                                    hover:border-[#333] transition-all shrink-0">
                                    {uploadingImage ? 'Uploading...' : 'Upload'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {formData.cover && (
                                <div className="mt-3 w-[200px] aspect-[16/9] bg-[#1a1a1a] rounded overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={formData.cover} alt="Cover preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content: Editor + Preview */}
                    <div>
                        <label className={`block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2 ${viewMode === 'preview' ? 'hidden' : ''}`}>
                            Content
                        </label>

                        {viewMode === 'split' ? (
                            <div className="grid grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
                                <div>
                                    <RichEditor
                                        value={formData.content}
                                        onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                                        folder="writing"
                                    />
                                </div>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2 text-right">
                                        Live Preview
                                    </div>
                                    <MarkdownPreview
                                        content={formData.content}
                                        title={formData.title}
                                        date={formData.date}
                                        cover={formData.cover}
                                    />
                                </div>
                            </div>
                        ) : viewMode === 'editor' ? (
                            <RichEditor
                                value={formData.content}
                                onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                                folder="writing"
                            />
                        ) : (
                            <MarkdownPreview
                                content={formData.content}
                                title={formData.title}
                                date={formData.date}
                                cover={formData.cover}
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-[#e5e5e0] text-[#0e0e0e] rounded-md text-[14px]
                                font-medium transition-all duration-200 hover:bg-[#d5d5d0]
                                disabled:opacity-40"
                        >
                            {saving ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                text-[14px] text-[#888] transition-all duration-200
                                hover:text-[#e5e5e0] hover:border-[#333]"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {message && (
                    <p className="mt-4 text-[13px] text-[#888]">{message}</p>
                )}
            </div>
        );
    }

    // List view
    return (
        <div>
            <div className="flex items-center justify-between mb-8 pt-4">
                <div>
                    <h1 className="font-serif text-[28px] text-[#e5e5e0] font-normal tracking-tight">
                        Posts
                    </h1>
                    <p className="text-[13px] text-[#666] mt-1">
                        {posts.length} post{posts.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ ...emptyPost });
                        setIsEditing(false);
                        setShowForm(true);
                        router.replace('/admin/posts?action=new');
                    }}
                    className="px-4 py-2 bg-[#e5e5e0] text-[#0e0e0e] rounded-md text-[13px]
                        font-medium transition-all duration-200 hover:bg-[#d5d5d0]"
                >
                    + New Post
                </button>
            </div>

            {message && (
                <p className="mb-4 text-[13px] text-[#888]">{message}</p>
            )}

            {loading ? (
                <p className="text-[13px] text-[#555]">Loading...</p>
            ) : posts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[#555] text-[15px]">No posts yet</p>
                    <p className="text-[#444] text-[13px] mt-1">Create your first post to get started</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {posts.map((post) => (
                        <div
                            key={post.slug}
                            className="flex items-center justify-between p-4 bg-[#141414] border border-[#222]
                                rounded-lg hover:border-[#333] transition-all duration-200 group"
                        >
                            <div className="min-w-0">
                                <p className="text-[15px] text-[#e5e5e0] truncate">{post.title}</p>
                                <p className="text-[12px] text-[#555] mt-0.5">
                                    {post.date}
                                    {post.excerpt && ` · ${post.excerpt.substring(0, 60)}${post.excerpt.length > 60 ? '...' : ''}`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        router.replace(`/admin/posts?edit=${post.slug}`);
                                    }}
                                    className="px-3 py-1.5 text-[12px] text-[#888] hover:text-[#e5e5e0]
                                        bg-[#1a1a1a] border border-[#2a2a2a] rounded
                                        hover:border-[#333] transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(post.slug)}
                                    disabled={deleting === post.slug}
                                    className="px-3 py-1.5 text-[12px] text-[#e34040] hover:text-[#ff5555]
                                        bg-[#1a1a1a] border border-[#2a2a2a] rounded
                                        hover:border-[#3a2020] transition-all disabled:opacity-40"
                                >
                                    {deleting === post.slug ? '...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminPostsPage() {
    return (
        <Suspense fallback={<div className="pt-4 text-[13px] text-[#555]">Loading...</div>}>
            <PostsContent />
        </Suspense>
    );
}
