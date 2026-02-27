'use client';

import React, { useEffect, useRef } from 'react';

// The sensitivity configuration for each letter.
// This gives each character its own personality.
const LETTERS = [
    { char: 'U', s: 0.9 },
    { char: 't', s: 0.5 },
    { char: 't', s: 0.8 },
    { char: 'a', s: 0.3 },
    { char: 'm', s: 0.6 },
    { char: ' ', s: 0 },
    { char: 'B', s: 0.9 },
    { char: 'a', s: 0.7 },
    { char: 'k', s: 0.4 },
    { char: 'o', s: 0.8 },
    { char: 'r', s: 0.5 },
    { char: 'i', s: 0.3 }
];

const MAX_DISPLACEMENT = 3.5;
const MAX_DISTANCE = 400;
const LERP_FACTOR = 0.08;

export default function MagneticName() {
    const containerRef = useRef<HTMLHeadingElement>(null);
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        // Only run the interactive effect on devices with a mouse
        // and disable the CSS fallback animation for them.
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (isTouchDevice) {
            return;
        }

        // On desktop, cancel the CSS idleFloat animation immediately
        letterRefs.current.forEach((el) => {
            if (el) {
                el.style.animation = 'none';
            }
        });

        let animationFrameId: number;
        let mouseX = 0;
        let mouseY = 0;

        // Current sub-pixel position of each letter
        const currentX = new Array(LETTERS.length).fill(0);
        const currentY = new Array(LETTERS.length).fill(0);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            LETTERS.forEach((letter, i) => {
                if (letter.char === ' ') return; // Skip spacing spans

                const el = letterRefs.current[i];
                if (!el) return;

                const rect = el.getBoundingClientRect();
                const letterCenterX = rect.left + rect.width / 2;
                const letterCenterY = rect.top + rect.height / 2;

                const deltaX = mouseX - letterCenterX;
                const deltaY = mouseY - letterCenterY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                let targetX = 0;
                let targetY = 0;

                // Only influence letters within the sphere of influence
                if (distance > 0 && distance < MAX_DISTANCE) {
                    const strength = 1 - distance / MAX_DISTANCE;
                    targetX = (deltaX / distance) * strength * MAX_DISPLACEMENT * letter.s;
                    targetY = (deltaY / distance) * strength * MAX_DISPLACEMENT * letter.s;
                }

                // Languid easing
                currentX[i] += (targetX - currentX[i]) * LERP_FACTOR;
                currentY[i] += (targetY - currentY[i]) * LERP_FACTOR;

                el.style.transform = `translate(${currentX[i]}px, ${currentY[i]}px)`;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <h1
            ref={containerRef}
            className="flex justify-center items-baseline font-serif text-[36px] md:text-[64px] text-primary font-normal tracking-tight"
            style={{ gap: 0 }}
            aria-label="Uttam Bakori"
        >
            {LETTERS.map((l, i) => (
                l.char === ' ' ? (
                    <span key={i} className="letter-space" style={{ width: '0.25em' }}>&nbsp;</span>
                ) : (
                    <span
                        key={i}
                        ref={(el) => { letterRefs.current[i] = el; }}
                        aria-hidden="true"
                        className="letter inline-block"
                        style={{
                            willChange: 'transform',
                            // Fallback idle animation. Gets cancelled by JS on desktop.
                            animation: `idleFloat ${4 + Math.random() * 2}s ease-in-out ${i * 0.3}s infinite`
                        }}
                    >
                        {l.char}
                    </span>
                )
            ))}
        </h1>
    );
}
