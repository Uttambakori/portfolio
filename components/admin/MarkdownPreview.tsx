'use client';

import { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownPreviewProps {
    content: string;
    title?: string;
    date?: string;
    cover?: string;
}

export default function MarkdownPreview({ content, title, date, cover }: MarkdownPreviewProps) {
    const html = useMemo(() => {
        if (!content) return '';

        // Configure marked
        marked.setOptions({
            breaks: true,
            gfm: true,
        });

        try {
            return marked(content) as string;
        } catch {
            return '<p class="text-red-400">Error rendering preview</p>';
        }
    }, [content]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="h-full overflow-auto bg-[#0e0e0e] rounded-lg border border-[#2a2a2a]">
            <div className="max-w-[640px] mx-auto px-8 py-10">
                {/* Post header preview */}
                {(title || date) && (
                    <div className="mb-8">
                        {date && (
                            <p className="text-[12px] text-[#555] font-mono mb-3">
                                {formatDate(date)}
                            </p>
                        )}
                        {title && (
                            <h1 className="font-serif text-[28px] md:text-[36px] text-[#e5e5e0] font-normal leading-tight">
                                {title}
                            </h1>
                        )}
                    </div>
                )}

                {/* Cover image preview */}
                {cover && (
                    <div className="mb-8 rounded-md overflow-hidden bg-[#1a1a1a] aspect-[16/9]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Rendered content */}
                <div
                    className="preview-prose"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </div>

            {/* Preview prose styles */}
            <style jsx global>{`
                .preview-prose {
                    color: #c5c5c0;
                    font-size: 15px;
                    line-height: 1.8;
                }
                .preview-prose h1 {
                    font-family: var(--font-serif, Georgia, serif);
                    font-size: 28px;
                    font-weight: 400;
                    color: #e5e5e0;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                }
                .preview-prose h2 {
                    font-family: var(--font-serif, Georgia, serif);
                    font-size: 22px;
                    font-weight: 400;
                    color: #e5e5e0;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                }
                .preview-prose h3 {
                    font-family: var(--font-serif, Georgia, serif);
                    font-size: 18px;
                    font-weight: 400;
                    color: #e5e5e0;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                .preview-prose p {
                    margin-bottom: 1.25rem;
                }
                .preview-prose a {
                    color: #888;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .preview-prose a:hover {
                    color: #e5e5e0;
                }
                .preview-prose blockquote {
                    border-left: 2px solid #333;
                    padding-left: 1.25rem;
                    color: #888;
                    font-style: italic;
                    margin: 1.5rem 0;
                }
                .preview-prose ul {
                    list-style: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1.25rem;
                }
                .preview-prose ol {
                    list-style: decimal;
                    padding-left: 1.5rem;
                    margin-bottom: 1.25rem;
                }
                .preview-prose li {
                    margin-bottom: 0.5rem;
                }
                .preview-prose code {
                    font-family: monospace;
                    font-size: 0.9em;
                    background: #1a1a1a;
                    padding: 2px 6px;
                    border-radius: 3px;
                }
                .preview-prose pre {
                    background: #1a1a1a;
                    padding: 1.25rem;
                    border-radius: 6px;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                }
                .preview-prose pre code {
                    background: none;
                    padding: 0;
                }
                .preview-prose hr {
                    border: none;
                    border-top: 1px solid #2a2a2a;
                    margin: 2.5rem 0;
                }
                .preview-prose img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    margin: 1rem 0;
                }
                .preview-prose table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                }
                .preview-prose th, .preview-prose td {
                    border: 1px solid #2a2a2a;
                    padding: 8px 12px;
                    text-align: left;
                }
                .preview-prose th {
                    background: #1a1a1a;
                    color: #e5e5e0;
                }
                .preview-prose .figma-embed {
                    width: 100%;
                    border-radius: 6px;
                    overflow: hidden;
                    margin: 1.5rem 0;
                    border: 1px solid #2a2a2a;
                }
                .preview-prose .figma-embed iframe {
                    width: 100%;
                    height: 450px;
                    border: none;
                }
                .preview-prose .pdf-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 16px;
                    background: #1a1a1a;
                    border: 1px solid #2a2a2a;
                    border-radius: 8px;
                    color: #e5e5e0;
                    text-decoration: none;
                    margin: 1rem 0;
                    transition: border-color 0.2s;
                }
                .preview-prose .pdf-link:hover {
                    border-color: #444;
                }
            `}</style>
        </div>
    );
}
