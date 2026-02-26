'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export default function FadeIn({
    children,
    delay = 0,
    duration = 0.6,
    className = '',
}: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0, 0, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
