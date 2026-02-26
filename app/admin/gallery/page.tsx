'use client';

import { Suspense, useEffect, useState } from 'react';

interface GalleryItem {
    id: string;
    src: string;
    title: string;
    category: string;
    width: number;
    height: number;
}

const emptyItem = {
    src: '',
    title: '',
    category: '',
    width: 800,
    height: 800,
};

function GalleryContent() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [formData, setFormData] = useState(emptyItem);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => { fetchItems(); }, []);

    async function fetchItems() {
        try {
            const res = await fetch('/api/admin/gallery');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Error:', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const method = editingItem ? 'PUT' : 'POST';
            const body = editingItem ? { ...formData, id: editingItem.id } : formData;

            const res = await fetch('/api/admin/gallery', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setMessage(editingItem ? 'Updated!' : 'Added!');
                setShowForm(false);
                setEditingItem(null);
                setFormData(emptyItem);
                await fetchItems();
            } else {
                const data = await res.json();
                setMessage(data.error || 'Error');
            }
        } catch {
            setMessage('Error saving');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this image?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchItems();
                setMessage('Deleted');
            }
        } catch {
            setMessage('Error deleting');
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
            fd.append('folder', 'gallery');

            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const data = await res.json();
                setFormData((prev) => ({ ...prev, src: data.path }));

                // Try to get image dimensions
                const img = new Image();
                img.onload = () => {
                    setFormData((prev) => ({ ...prev, width: img.naturalWidth, height: img.naturalHeight }));
                };
                img.src = data.path;
            }
        } catch {
            setMessage('Upload failed');
        } finally {
            setUploadingImage(false);
        }
    }

    function openEdit(item: GalleryItem) {
        setEditingItem(item);
        setFormData({ src: item.src, title: item.title, category: item.category, width: item.width, height: item.height });
        setShowForm(true);
    }

    function handleCancel() {
        setShowForm(false);
        setEditingItem(null);
        setFormData(emptyItem);
    }

    // Form view
    if (showForm) {
        return (
            <div>
                <div className="flex items-center justify-between mb-8 pt-4">
                    <h1 className="font-serif text-[28px] text-[#e5e5e0] font-normal tracking-tight">
                        {editingItem ? 'Edit Image' : 'Add Image'}
                    </h1>
                    <button onClick={handleCancel} className="text-[13px] text-[#666] hover:text-[#e5e5e0] transition-colors">
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Image source */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">
                            Image
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={formData.src}
                                onChange={(e) => setFormData((p) => ({ ...p, src: e.target.value }))}
                                placeholder="/gallery/image.jpg or https://..."
                                required
                                className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                    text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none focus:border-[#444] transition-colors"
                            />
                            <label className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                text-[13px] text-[#888] cursor-pointer hover:text-[#e5e5e0] hover:border-[#333] transition-all shrink-0">
                                {uploadingImage ? 'Uploading...' : 'Upload'}
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                        {formData.src && (
                            <div className="mt-3 w-[180px] bg-[#1a1a1a] rounded overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={formData.src} alt="Preview" className="w-full h-auto" />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                            placeholder="Image title"
                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none focus:border-[#444] transition-colors"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                            placeholder="e.g. Digital Art, Brand Identity, Poster Design"
                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                text-[15px] text-[#e5e5e0] placeholder-[#444] outline-none focus:border-[#444] transition-colors"
                        />
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">Width</label>
                            <input
                                type="number"
                                value={formData.width}
                                onChange={(e) => setFormData((p) => ({ ...p, width: parseInt(e.target.value) || 800 }))}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                    text-[15px] text-[#e5e5e0] outline-none focus:border-[#444] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555] mb-2">Height</label>
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData((p) => ({ ...p, height: parseInt(e.target.value) || 800 }))}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                    text-[15px] text-[#e5e5e0] outline-none focus:border-[#444] transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-[#e5e5e0] text-[#0e0e0e] rounded-md text-[14px]
                                font-medium transition-all hover:bg-[#d5d5d0] disabled:opacity-40"
                        >
                            {saving ? 'Saving...' : editingItem ? 'Update' : 'Add Image'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                text-[14px] text-[#888] hover:text-[#e5e5e0] hover:border-[#333] transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {message && <p className="mt-4 text-[13px] text-[#888]">{message}</p>}
            </div>
        );
    }

    // Grid view
    return (
        <div>
            <div className="flex items-center justify-between mb-8 pt-4">
                <div>
                    <h1 className="font-serif text-[28px] text-[#e5e5e0] font-normal tracking-tight">Gallery</h1>
                    <p className="text-[13px] text-[#666] mt-1">{items.length} image{items.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => { setFormData(emptyItem); setEditingItem(null); setShowForm(true); }}
                    className="px-4 py-2 bg-[#e5e5e0] text-[#0e0e0e] rounded-md text-[13px] font-medium hover:bg-[#d5d5d0] transition-all"
                >
                    + Add Image
                </button>
            </div>

            {message && <p className="mb-4 text-[13px] text-[#888]">{message}</p>}

            {loading ? (
                <p className="text-[13px] text-[#555]">Loading...</p>
            ) : items.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[#555] text-[15px]">No images yet</p>
                    <p className="text-[#444] text-[13px] mt-1">Add your first gallery image</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {items.map((item) => (
                        <div key={item.id} className="group relative bg-[#141414] border border-[#222] rounded-lg overflow-hidden
                            hover:border-[#333] transition-all">
                            <div className="aspect-square overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                                <p className="text-[13px] text-[#e5e5e0] truncate">{item.title || 'Untitled'}</p>
                                <p className="text-[11px] text-[#555] mt-0.5">{item.category}</p>
                            </div>
                            {/* Actions */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(item)}
                                    className="px-2 py-1 text-[11px] bg-[#1a1a1a]/90 text-[#888] hover:text-[#e5e5e0]
                                        rounded border border-[#333] transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deleting === item.id}
                                    className="px-2 py-1 text-[11px] bg-[#1a1a1a]/90 text-[#e34040] hover:text-[#ff5555]
                                        rounded border border-[#333] transition-all disabled:opacity-40"
                                >
                                    {deleting === item.id ? '...' : '✕'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminGalleryPage() {
    return (
        <Suspense fallback={<div className="pt-4 text-[13px] text-[#555]">Loading...</div>}>
            <GalleryContent />
        </Suspense>
    );
}
