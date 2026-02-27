'use client';

import { Suspense, useEffect, useState, useRef } from 'react';

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

interface UploadProgress {
    total: number;
    completed: number;
    current: string;
}

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
    const [aiSuggestion, setAiSuggestion] = useState<{ category: string; title: string } | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const multiInputRef = useRef<HTMLInputElement>(null);

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

    // AI categorize image
    async function categorizeImage(imageSrc: string) {
        setAiLoading(true);
        setAiSuggestion(null);

        try {
            // Fetch image and convert to base64
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            const reader = new FileReader();

            const base64 = await new Promise<string>((resolve) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
                };
                reader.readAsDataURL(blob);
            });

            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: base64,
                    mimeType: blob.type
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setAiSuggestion(data);
                return data;
            }
        } catch (err) {
            console.error('AI categorization error:', err);
        } finally {
            setAiLoading(false);
        }
        return null;
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
                setAiSuggestion(null);
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

    // Bulk upload handler
    async function handleBulkUpload(files: FileList | null) {
        if (!files || files.length === 0) return;

        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            setMessage('No image files found');
            return;
        }

        setBulkUploading(true);
        setUploadProgress({ total: imageFiles.length, completed: 0, current: '' });

        let successCount = 0;

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            setUploadProgress({ total: imageFiles.length, completed: i, current: file.name });

            try {
                // Upload file
                const fd = new FormData();
                fd.append('file', file);
                fd.append('folder', 'gallery');

                const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                if (!uploadRes.ok) continue;
                const uploadData = await uploadRes.json();

                // Get image dimensions
                let width = 800, height = 800;
                try {
                    const img = new window.Image();
                    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
                        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
                        img.onerror = () => resolve({ w: 800, h: 800 });
                        img.src = uploadData.path;
                    });
                    width = dims.w;
                    height = dims.h;
                } catch { /* use defaults */ }

                // Use filename as title, skip AI to keep bulk upload fast
                const category = 'Uncategorized';
                const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

                // Add to gallery
                const galleryRes = await fetch('/api/admin/gallery', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ src: uploadData.path, title, category, width, height }),
                });

                if (galleryRes.ok) successCount++;
            } catch (err) {
                console.error(`Error uploading ${file.name}:`, err);
            }
        }

        setUploadProgress(null);
        setBulkUploading(false);
        setMessage(`Uploaded ${successCount}/${imageFiles.length} images`);
        await fetchItems();
    }

    function openEdit(item: GalleryItem) {
        setEditingItem(item);
        setFormData({ src: item.src, title: item.title, category: item.category, width: item.width, height: item.height });
        setShowForm(true);
        setAiSuggestion(null);
    }

    function handleCancel() {
        setShowForm(false);
        setEditingItem(null);
        setFormData(emptyItem);
        setAiSuggestion(null);
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

                    {/* AI Suggestion */}
                    {aiLoading && (
                        <div className="flex items-center gap-2 p-3 bg-[#1a1e2e] border border-[#2a3050] rounded-lg">
                            <span className="text-[12px] animate-pulse">🤖</span>
                            <span className="text-[12px] text-[#8888cc]">AI is analyzing your image...</span>
                        </div>
                    )}
                    {aiSuggestion && (
                        <div className="p-3 bg-[#1a1e2e] border border-[#2a3050] rounded-lg">
                            <p className="text-[11px] uppercase tracking-[0.1em] text-[#6666aa] mb-2">
                                🤖 AI Suggestion
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {aiSuggestion.title && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData((p) => ({ ...p, title: aiSuggestion.title }))}
                                        className="px-3 py-1.5 text-[12px] text-[#aaaaee] bg-[#222244] border border-[#333366]
                                            rounded-md hover:bg-[#2a2a55] transition-all"
                                    >
                                        Title: &ldquo;{aiSuggestion.title}&rdquo; → Use
                                    </button>
                                )}
                                {aiSuggestion.category && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData((p) => ({ ...p, category: aiSuggestion.category }))}
                                        className="px-3 py-1.5 text-[12px] text-[#aaaaee] bg-[#222244] border border-[#333366]
                                            rounded-md hover:bg-[#2a2a55] transition-all"
                                    >
                                        Category: &ldquo;{aiSuggestion.category}&rdquo; → Use
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData((p) => ({
                                            ...p,
                                            title: aiSuggestion.title || p.title,
                                            category: aiSuggestion.category || p.category,
                                        }));
                                    }}
                                    className="px-3 py-1.5 text-[12px] text-[#0e0e0e] bg-[#aaaaee]
                                        rounded-md hover:bg-[#9999dd] transition-all font-medium"
                                >
                                    Use Both
                                </button>
                            </div>
                        </div>
                    )}

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
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#555]">Category</label>
                            {formData.src && !aiLoading && (
                                <button
                                    type="button"
                                    onClick={() => categorizeImage(formData.src)}
                                    className="text-[11px] text-[#6666aa] hover:text-[#aaaaee] transition-colors"
                                >
                                    🤖 Ask AI
                                </button>
                            )}
                        </div>
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
            <div className="flex items-center justify-between mb-6 pt-4">
                <div>
                    <h1 className="font-serif text-[28px] text-[#e5e5e0] font-normal tracking-tight">Gallery</h1>
                    <p className="text-[13px] text-[#666] mt-1">{items.length} image{items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => multiInputRef.current?.click()}
                        disabled={bulkUploading}
                        className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] rounded-md text-[13px]
                            hover:text-[#e5e5e0] hover:border-[#333] transition-all disabled:opacity-40"
                    >
                        ↑ Bulk Upload
                    </button>
                    <button
                        onClick={() => folderInputRef.current?.click()}
                        disabled={bulkUploading}
                        className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] rounded-md text-[13px]
                            hover:text-[#e5e5e0] hover:border-[#333] transition-all disabled:opacity-40"
                    >
                        📁 Upload Folder
                    </button>
                    <button
                        onClick={() => { setFormData(emptyItem); setEditingItem(null); setShowForm(true); }}
                        className="px-4 py-2 bg-[#e5e5e0] text-[#0e0e0e] rounded-md text-[13px] font-medium hover:bg-[#d5d5d0] transition-all"
                    >
                        + Add Image
                    </button>
                </div>
            </div>

            {/* Hidden file inputs */}
            <input
                ref={multiInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleBulkUpload(e.target.files)}
                className="hidden"
            />
            <input
                ref={folderInputRef}
                type="file"
                accept="image/*"
                // @ts-expect-error - webkitdirectory is a non-standard attribute
                webkitdirectory=""
                directory=""
                multiple
                onChange={(e) => handleBulkUpload(e.target.files)}
                className="hidden"
            />

            {/* Upload Progress */}
            {uploadProgress && (
                <div className="mb-6 p-4 bg-[#141414] border border-[#222] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] text-[#e5e5e0]">
                            Uploading {uploadProgress.completed + 1}/{uploadProgress.total}
                        </span>
                        <span className="text-[11px] text-[#555] truncate max-w-[200px]">
                            {uploadProgress.current}
                        </span>
                    </div>
                    <div className="w-full bg-[#222] rounded-full h-1.5">
                        <div
                            className="bg-[#e5e5e0] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-[#555] mt-2">
                        You can categorize images later using the edit button
                    </p>
                </div>
            )}

            {message && <p className="mb-4 text-[13px] text-[#888]">{message}</p>}

            {loading ? (
                <p className="text-[13px] text-[#555]">Loading...</p>
            ) : items.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[#555] text-[15px]">No images yet</p>
                    <p className="text-[#444] text-[13px] mt-1">Add your first gallery image or upload a folder</p>
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
