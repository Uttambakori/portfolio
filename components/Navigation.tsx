'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { href: '/work', label: 'Work' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/writing', label: 'Writing' },
    { href: '/about', label: 'About' },
];

const panelVariants = {
    closed: {
        x: '100%',
        transition: {
            duration: 0.5,
            ease: [0.32, 0, 0.67, 0] as const,
        },
    },
    open: {
        x: '0%',
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
};

const linkVariants = {
    closed: { opacity: 0, x: 30 },
    open: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            delay: 0.15 + i * 0.08,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    }),
};

export default function Navigation() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 60);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent background scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    return (
        <nav
            className={`w-full px-6 md:px-10 lg:px-16 py-5 md:py-8 fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out-expo ${isScrolled
                ? 'bg-background/80 backdrop-blur-[12px] shadow-[0_1px_0_rgba(0,0,0,0.04)]'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                <Link
                    href="/"
                    className="font-serif text-xl text-primary no-underline transition-colors duration-300 hover:text-secondary"
                >
                    Uttam Bakori
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-[14px] uppercase tracking-[0.05em] font-sans no-underline transition-colors duration-300 relative ${pathname === link.href || pathname?.startsWith(link.href + '/')
                                ? 'text-primary'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            {link.label}
                            {(pathname === link.href || pathname?.startsWith(link.href + '/')) && (
                                <motion.span
                                    layoutId="nav-underline"
                                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-primary"
                                    transition={{ duration: 0.3, ease: [0.25, 0, 0, 1] }}
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Mobile menu toggle — text-based */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden relative overflow-hidden h-[20px] flex items-center"
                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMobileMenuOpen}
                >
                    <AnimatePresence mode="wait">
                        {isMobileMenuOpen ? (
                            <motion.span
                                key="close"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="text-[14px] uppercase tracking-[0.08em] font-sans text-primary select-none"
                            >
                                Close
                            </motion.span>
                        ) : (
                            <motion.span
                                key="menu"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="text-[14px] uppercase tracking-[0.08em] font-sans text-primary select-none"
                            >
                                Menu
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Mobile slide-in panel */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            variants={backdropVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            transition={{ duration: 0.4 }}
                            className="fixed inset-0 bg-primary/10 backdrop-blur-[6px] md:hidden z-40"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            variants={panelVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 right-0 bottom-0 w-[280px] bg-background shadow-[-8px_0_30px_rgba(0,0,0,0.05)] md:hidden z-50 flex flex-col"
                        >
                            {/* Panel header */}
                            <div className="px-8 py-6 flex justify-end">
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-[14px] uppercase tracking-[0.08em] font-sans text-secondary hover:text-primary transition-colors duration-300 select-none"
                                    aria-label="Close menu"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Panel links */}
                            <div className="flex-1 flex flex-col justify-center px-8 gap-1">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.href}
                                        variants={linkVariants}
                                        initial="closed"
                                        animate="open"
                                        exit="closed"
                                        custom={i}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`block py-3 font-serif text-[28px] no-underline transition-colors duration-300 ${pathname === link.href || pathname?.startsWith(link.href + '/')
                                                ? 'text-primary'
                                                : 'text-secondary hover:text-primary'
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                        {i < navLinks.length - 1 && (
                                            <div className="h-[1px] bg-accent-secondary" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Panel footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.4 } }}
                                exit={{ opacity: 0 }}
                                className="px-8 py-8 border-t border-accent-secondary"
                            >
                                <a
                                    href="mailto:hello@uttambakori.com"
                                    className="text-caption text-secondary no-underline hover:text-primary transition-colors duration-300"
                                >
                                    hello@uttambakori.com
                                </a>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
