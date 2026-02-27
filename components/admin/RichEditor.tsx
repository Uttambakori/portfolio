'use client';

import { useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const DrawingCanvas = dynamic(() => import('./DrawingCanvas'), { ssr: false });

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
    folder?: string;
}

interface ToolbarButton {
    label: string;
    icon: string;
    action: () => void;
    title: string;
}

export default function RichEditor({ value, onChange, folder = 'uploads' }: RichEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const [showDrawing, setShowDrawing] = useState(false);
    const [showFigmaModal, setShowFigmaModal] = useState(false);
    const [figmaUrl, setFigmaUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // Insert text at cursor position
    const insertAtCursor = useCallback((before: string, after: string = '', placeholder: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end) || placeholder;

        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
        onChange(newText);

        // Restore cursor position after React re-render
        setTimeout(() => {
            textarea.focus();
            const cursorPos = start + before.length + selectedText.length;
            textarea.setSelectionRange(cursorPos, cursorPos);
        }, 0);
    }, [value, onChange]);

    // Wrap selected text
    const wrapSelection = useCallback((wrapper: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        if (selectedText) {
            const newText = value.substring(0, start) + wrapper + selectedText + wrapper + value.substring(end);
            onChange(newText);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + wrapper.length, end + wrapper.length);
            }, 0);
        } else {
            insertAtCursor(wrapper, wrapper, 'text');
        }
    }, [value, onChange, insertAtCursor]);

    // Line prefix (for headings, lists, etc.)
    const insertLinePrefix = useCallback((prefix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        // Find the start of the current line
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart);
        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length);
        }, 0);
    }, [value, onChange]);

    // Handle image upload
    const uploadImage = async (file: File): Promise<string | null> => {
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', folder);

            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const data = await res.json();
                return data.path;
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
        return null;
    };

    // Handle image file select
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const path = await uploadImage(file);
        if (path) {
            insertAtCursor(`\n![${file.name.replace(/\.[^/.]+$/, '')}](${path})\n`);
        }
        e.target.value = '';
    };

    // Handle PDF file select
    const handlePDFSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'uploads');

            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const data = await res.json();
                const pdfName = file.name.replace(/\.[^/.]+$/, '');
                insertAtCursor(`\n[📄 ${pdfName} (PDF)](${data.path})\n`);
            }
        } catch (err) {
            console.error('PDF upload failed:', err);
        } finally {
            setUploading(false);
        }
        e.target.value = '';
    };

    // Handle drag & drop
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const path = await uploadImage(file);
                if (path) {
                    insertAtCursor(`\n![${file.name.replace(/\.[^/.]+$/, '')}](${path})\n`);
                }
            } else if (file.type === 'application/pdf') {
                setUploading(true);
                try {
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('folder', 'uploads');
                    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                    if (res.ok) {
                        const data = await res.json();
                        insertAtCursor(`\n[📄 ${file.name} (PDF)](${data.path})\n`);
                    }
                } catch (err) {
                    console.error('Upload failed:', err);
                } finally {
                    setUploading(false);
                }
            }
        }
    };

    // Handle drawing save
    const handleDrawingSave = async (dataUrl: string) => {
        setShowDrawing(false);
        setUploading(true);
        try {
            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `drawing-${Date.now()}.png`, { type: 'image/png' });

            const path = await uploadImage(file);
            if (path) {
                insertAtCursor(`\n![Drawing](${path})\n`);
            }
        } catch (err) {
            console.error('Drawing save failed:', err);
        } finally {
            setUploading(false);
        }
    };

    // Handle Figma embed
    const handleFigmaInsert = () => {
        if (!figmaUrl) return;

        // Extract Figma file key and create embed URL
        const embedUrl = figmaUrl.includes('figma.com')
            ? `https://www.figma.com/embed?embed_host=portfolio&url=${encodeURIComponent(figmaUrl)}`
            : figmaUrl;

        insertAtCursor(`\n<div class="figma-embed"><iframe src="${embedUrl}" allowfullscreen></iframe></div>\n`);
        setFigmaUrl('');
        setShowFigmaModal(false);
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const isMod = e.metaKey || e.ctrlKey;

        if (isMod && e.key === 'b') {
            e.preventDefault();
            wrapSelection('**');
        } else if (isMod && e.key === 'i') {
            e.preventDefault();
            wrapSelection('_');
        } else if (isMod && e.key === 'k') {
            e.preventDefault();
            insertAtCursor('[', '](url)', 'link text');
        } else if (e.key === 'Tab') {
            e.preventDefault();
            insertAtCursor('  ');
        }
    };

    // Toolbar buttons
    const toolbarGroups: ToolbarButton[][] = [
        [
            { label: 'H1', icon: 'H₁', action: () => insertLinePrefix('# '), title: 'Heading 1' },
            { label: 'H2', icon: 'H₂', action: () => insertLinePrefix('## '), title: 'Heading 2' },
            { label: 'H3', icon: 'H₃', action: () => insertLinePrefix('### '), title: 'Heading 3' },
        ],
        [
            { label: 'Bold', icon: 'B', action: () => wrapSelection('**'), title: 'Bold (⌘B)' },
            { label: 'Italic', icon: 'I', action: () => wrapSelection('_'), title: 'Italic (⌘I)' },
            { label: 'Code', icon: '<>', action: () => wrapSelection('`'), title: 'Inline Code' },
        ],
        [
            { label: 'UL', icon: '•', action: () => insertLinePrefix('- '), title: 'Bullet List' },
            { label: 'OL', icon: '1.', action: () => insertLinePrefix('1. '), title: 'Numbered List' },
            { label: 'Quote', icon: '❝', action: () => insertLinePrefix('> '), title: 'Blockquote' },
        ],
        [
            { label: 'Link', icon: '🔗', action: () => insertAtCursor('[', '](url)', 'link text'), title: 'Insert Link (⌘K)' },
            { label: 'HR', icon: '—', action: () => insertAtCursor('\n---\n'), title: 'Horizontal Rule' },
            { label: 'Code Block', icon: '{ }', action: () => insertAtCursor('\n```\n', '\n```\n', 'code here'), title: 'Code Block' },
        ],
    ];

    return (
        <div className="space-y-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2.5 bg-[#161616] border border-[#2a2a2a]
                rounded-t-lg border-b-0">
                {toolbarGroups.map((group, gi) => (
                    <div key={gi} className="flex items-center gap-0.5">
                        {group.map((btn) => (
                            <button
                                key={btn.label}
                                type="button"
                                onClick={btn.action}
                                title={btn.title}
                                className="px-2 py-1.5 text-[12px] text-[#888] hover:text-[#e5e5e0]
                                    hover:bg-[#222] rounded transition-all min-w-[28px]"
                            >
                                {btn.icon}
                            </button>
                        ))}
                        {gi < toolbarGroups.length - 1 && (
                            <div className="w-px h-5 bg-[#2a2a2a] mx-1" />
                        )}
                    </div>
                ))}

                <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

                {/* Special buttons */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Insert Image"
                    className="px-2 py-1.5 text-[12px] text-[#888] hover:text-[#e5e5e0]
                        hover:bg-[#222] rounded transition-all"
                >
                    🖼️ Image
                </button>
                <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    title="Attach PDF"
                    className="px-2 py-1.5 text-[12px] text-[#888] hover:text-[#e5e5e0]
                        hover:bg-[#222] rounded transition-all"
                >
                    📄 PDF
                </button>
                <button
                    type="button"
                    onClick={() => setShowDrawing(true)}
                    title="Open Drawing Canvas"
                    className="px-2 py-1.5 text-[12px] text-[#888] hover:text-[#e5e5e0]
                        hover:bg-[#222] rounded transition-all"
                >
                    ✏️ Draw
                </button>
                <button
                    type="button"
                    onClick={() => setShowFigmaModal(true)}
                    title="Embed Figma File"
                    className="px-2 py-1.5 text-[12px] text-[#888] hover:text-[#e5e5e0]
                        hover:bg-[#222] rounded transition-all"
                >
                    ◆ Figma
                </button>

                {uploading && (
                    <span className="text-[11px] text-[#888] ml-2 animate-pulse">
                        Uploading...
                    </span>
                )}
            </div>

            {/* Editor textarea */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative ${dragOver ? 'ring-2 ring-[#4ecdc4]/50' : ''}`}
            >
                {dragOver && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center
                        bg-[#1a1a1a]/90 border-2 border-dashed border-[#4ecdc4] rounded-b-lg">
                        <p className="text-[14px] text-[#4ecdc4]">Drop images or PDFs here</p>
                    </div>
                )}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={20}
                    placeholder="Start writing... Use the toolbar above or drag & drop images.

Keyboard shortcuts:
  ⌘B  Bold
  ⌘I  Italic
  ⌘K  Link
  Tab  Indent"
                    className="w-full px-5 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-b-lg
                        text-[15px] text-[#e5e5e0] placeholder-[#3a3a3a] outline-none font-mono
                        focus:border-[#444] transition-colors resize-y leading-relaxed
                        min-h-[400px]"
                />
            </div>

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />
            <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePDFSelect}
                className="hidden"
            />

            {/* Drawing Canvas Modal */}
            {showDrawing && (
                <DrawingCanvas
                    onSave={handleDrawingSave}
                    onClose={() => setShowDrawing(false)}
                />
            )}

            {/* Figma URL Modal */}
            {showFigmaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-[15px] text-[#e5e5e0] font-medium mb-4">Embed Figma File</h3>
                        <input
                            type="url"
                            value={figmaUrl}
                            onChange={(e) => setFigmaUrl(e.target.value)}
                            placeholder="https://www.figma.com/file/..."
                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md
                                text-[14px] text-[#e5e5e0] placeholder-[#444] outline-none
                                focus:border-[#444] transition-colors mb-4"
                            autoFocus
                        />
                        <p className="text-[11px] text-[#555] mb-4">
                            Paste your Figma file, prototype, or design URL. It will be embedded as an interactive preview.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowFigmaModal(false); setFigmaUrl(''); }}
                                className="px-4 py-2 text-[13px] text-[#888] bg-[#1a1a1a] border border-[#2a2a2a]
                                    rounded-md hover:text-[#e5e5e0] hover:border-[#333] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFigmaInsert}
                                disabled={!figmaUrl}
                                className="px-4 py-2 text-[13px] text-[#0e0e0e] bg-[#e5e5e0] rounded-md
                                    font-medium hover:bg-[#d5d5d0] transition-all disabled:opacity-40"
                            >
                                Embed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
