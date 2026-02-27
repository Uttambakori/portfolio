'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false });
const MarkdownPreview = dynamic(() => import('@/components/admin/MarkdownPreview'), { ssr: false });

interface Project {
    slug: string;
    title: string;
    description: string;
    date: string;
    category: string;
    cover: string;
    images: string[];
    featured: boolean;
    order: number;
    content: string;
}

const emptyProject: Omit<Project, 'slug'> & { slug: string } = {
    slug: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    cover: '',
    images: [],
    featured: false,
    order: 0,
    content: '',
};

function ProjectsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get('action');
    const editSlug = searchParams.get('edit');

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState<Project>(emptyProject);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState('');
    const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (action === 'new') {
            setFormData({ ...emptyProject });
            setIsEditing(false);
            setShowForm(true);
        } else if (editSlug) {
            const project = projects.find((p) => p.slug === editSlug);
            if (project) {
                setFormData({ ...project });
                setIsEditing(true);
                setShowForm(true);
            }
        }
    }, [action, editSlug, projects]);

    async function fetchProjects() {
        try {
            const res = await fetch('/api/admin/projects');
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching projects:', error);
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
            const res = await fetch('/api/admin/projects', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage(isEditing ? 'Project updated!' : 'Project created!');
                setShowForm(false);
                setFormData({ ...emptyProject });
                router.replace('/admin/projects');
                await fetchProjects();
            } else {
                const data = await res.json();
                setMessage(data.error || 'Error saving project');
            }
        } catch {
            setMessage('Error saving project');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(slug: string) {
        if (!confirm(`Delete project "${slug}"? This cannot be undone.`)) return;
        setDeleting(slug);

        try {
            const res = await fetch(`/api/admin/projects?slug=${slug}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await fetchProjects();
                setMessage('Project deleted');
            } else {
                setMessage('Error deleting project');
            }
        } catch {
            setMessage('Error deleting project');
        } finally {
            setDeleting(null);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'work');

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

    function handleCancel() {
        setShowForm(false);
        setFormData({ ...emptyProject });
        router.replace('/admin/projects');
    }

    // Form view
    if (showForm) {
        return (
            <div>
                <div className="flex items-center justify-between mb-6 pt-4">
                    <h1 className="font-serif text-[28px] text-[#e5e5e0] font-normal tracking-tight">
                        {isEditing ? 'Edit Project' : 'New Project'}
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
                    {/* Top fields */}
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
                                placeholder="my-project-name"
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
                                placeholder="Project Title"
                                required
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                    text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none
                                    focus:border-[#444] transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                Description
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief description"
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                    text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none
                                    focus:border-[#444] transition-colors"
                            />
                        </div>

                        {/* Row: Category + Date */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                                    }
                                    placeholder="Brand Identity"
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                        text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none
                                        focus:border-[#444] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, date: e.target.value }))
                                    }
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                        text-[15px] text-[#e5e5e0] outline-none
                                        focus:border-[#444] transition-colors [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Row: Order + Featured */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                                    Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))
                                    }
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                        text-[15px] text-[#e5e5e0] outline-none
                                        focus:border-[#444] transition-colors"
                                />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                                        }
                                        className="w-4 h-4 accent-[#e5e5e0]"
                                    />
                                    <span className="text-[13px] text-[#888]">Featured on homepage</span>
                                </label>
                            </div>
                        </div>

                        {/* Cover image */}
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
                                    placeholder="/work/cover.jpg"
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
                                <div className="mt-3 w-[200px] aspect-[16/10] bg-[#1a1a1a] rounded overflow-hidden">
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
                                        folder="work"
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
                                folder="work"
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
                            {saving ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
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
                        Projects
                    </h1>
                    <p className="text-[13px] text-[#666] mt-1">
                        {projects.length} project{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ ...emptyProject });
                        setIsEditing(false);
                        setShowForm(true);
                        router.replace('/admin/projects?action=new');
                    }}
                    className="px-4 py-2 bg-[#e5e5e0] text-[#0e0e0e] rounded-md text-[13px]
                        font-medium transition-all duration-200 hover:bg-[#d5d5d0]"
                >
                    + New Project
                </button>
            </div>

            {message && (
                <p className="mb-4 text-[13px] text-[#888]">{message}</p>
            )}

            {loading ? (
                <p className="text-[13px] text-[#555]">Loading...</p>
            ) : projects.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[#555] text-[15px]">No projects yet</p>
                    <p className="text-[#444] text-[13px] mt-1">Create your first project to get started</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {projects.map((project) => (
                        <div
                            key={project.slug}
                            className="flex items-center justify-between p-4 bg-[#141414] border border-[#222]
                                rounded-lg hover:border-[#333] transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                {project.cover && (
                                    <div className="w-12 h-8 rounded bg-[#1a1a1a] overflow-hidden shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={project.cover} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-[15px] text-[#e5e5e0] truncate">{project.title}</p>
                                    <p className="text-[12px] text-[#555] mt-0.5">
                                        {project.category}{project.featured ? ' · Featured' : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        router.replace(`/admin/projects?edit=${project.slug}`);
                                    }}
                                    className="px-3 py-1.5 text-[12px] text-[#888] hover:text-[#e5e5e0]
                                        bg-[#1a1a1a] border border-[#2a2a2a] rounded
                                        hover:border-[#333] transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(project.slug)}
                                    disabled={deleting === project.slug}
                                    className="px-3 py-1.5 text-[12px] text-[#e34040] hover:text-[#ff5555]
                                        bg-[#1a1a1a] border border-[#2a2a2a] rounded
                                        hover:border-[#3a2020] transition-all disabled:opacity-40"
                                >
                                    {deleting === project.slug ? '...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminProjectsPage() {
    return (
        <Suspense fallback={<div className="pt-4 text-[13px] text-[#555]">Loading...</div>}>
            <ProjectsContent />
        </Suspense>
    );
}
