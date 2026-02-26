'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="pt-[120px] pb-[60px]">
            <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
                <div className="border-t border-accent-secondary pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: copyright */}
                    <p className="text-small text-secondary uppercase">
                        Uttam Bakori · {currentYear}
                    </p>

                    {/* Center: social links */}
                    <div className="flex items-center gap-4 text-caption">
                        <a
                            href="mailto:hello@uttambakori.com"
                            className="text-secondary no-underline transition-colors duration-300 hover:text-primary"
                        >
                            Email
                        </a>
                        <span className="text-accent-secondary">·</span>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary no-underline transition-colors duration-300 hover:text-primary"
                        >
                            Instagram
                        </a>
                        <span className="text-accent-secondary">·</span>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary no-underline transition-colors duration-300 hover:text-primary"
                        >
                            Twitter
                        </a>
                    </div>

                    {/* Right: back to top */}
                    <button
                        onClick={scrollToTop}
                        className={`back-to-top text-small text-secondary uppercase cursor-pointer transition-all duration-300 hover:text-primary ${showBackToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        aria-label="Back to top"
                    >
                        ↑ Top
                    </button>
                </div>
            </div>
        </footer>
    );
}
