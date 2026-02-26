'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/FadeIn';

interface GalleryItem {
    id: string;
    src: string;
    title: string;
    category: string;
    width: number;
    height: number;
}

export default function GalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/gallery')
            .then((r) => r.json())
            .then((data) => {
                setItems(data);
                const cats = ['All', ...Array.from(new Set(data.map((item: GalleryItem) => item.category)))];
                setCategories(cats as string[]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedItem(null);
        },
        []
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Lock scroll when lightbox is open
    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedItem]);

    return (
        <>
            <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
                <div className="pt-[120px] md:pt-[160px]">
                    <FadeIn>
                        <h1 className="font-serif text-page-title-mobile md:text-page-title font-normal">
                            Gallery
                        </h1>
                        <p className="text-caption text-secondary mt-2">
                            A collection of designs, explorations, and visual work
                        </p>
                    </FadeIn>

                    {/* Category filters */}
                    <FadeIn delay={0.1}>
                        <div className="mt-8 flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-[13px] transition-all duration-300
                                        ${activeCategory === cat
                                            ? 'bg-primary text-background'
                                            : 'bg-accent-secondary/50 text-secondary hover:text-primary hover:bg-accent-secondary'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </FadeIn>
                </div>

                {/* Masonry grid */}
                <div className="mt-[50px] mb-[80px]">
                    {loading ? (
                        <div className="text-center py-20 text-secondary text-caption">Loading...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-secondary text-caption">No images yet</div>
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: i * 0.03,
                                            ease: [0.22, 1, 0.36, 1] as const,
                                        }}
                                        className="break-inside-avoid mb-4 group cursor-pointer"
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        <div className="relative overflow-hidden rounded-[6px] bg-image-placeholder">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.src}
                                                alt={item.title}
                                                width={item.width}
                                                height={item.height}
                                                loading={i < 6 ? 'eager' : 'lazy'}
                                                className="w-full h-auto block transition-transform duration-700 ease-out-expo
                                                    group-hover:scale-[1.03]"
                                            />
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
                                                opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-5">
                                                <div>
                                                    <p className="text-white text-[15px] font-medium">{item.title}</p>
                                                    <p className="text-white/70 text-[12px] mt-0.5">{item.category}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 md:p-12"
                        onClick={() => setSelectedItem(null)}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 text-white/60 hover:text-white text-[14px]
                                uppercase tracking-[0.08em] transition-colors z-10"
                        >
                            Close
                        </button>

                        {/* Image */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                            className="max-w-[90vw] max-h-[85vh] relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={selectedItem.src}
                                alt={selectedItem.title}
                                className="max-w-full max-h-[80vh] object-contain rounded-[4px]"
                            />
                            <div className="mt-4 text-center">
                                <p className="text-white text-[16px]">{selectedItem.title}</p>
                                <p className="text-white/50 text-[13px] mt-1">{selectedItem.category}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
