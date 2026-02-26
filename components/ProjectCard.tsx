'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProjectCardProps {
    slug: string;
    title: string;
    description: string;
    cover: string;
    category?: string;
}

export default function ProjectCard({
    slug,
    title,
    description,
    cover,
    category,
}: ProjectCardProps) {
    return (
        <Link href={`/work/${slug}`} className="group block no-underline">
            <motion.div
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.5, ease: [0.25, 0, 0, 1] }}
                className="overflow-hidden rounded-[6px] bg-image-placeholder aspect-[4/3] relative"
            >
                <Image
                    src={cover}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
                    quality={90}
                />
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
            <div className="mt-4">
                <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-lg text-primary transition-colors duration-300 group-hover:text-link">
                        {title}
                    </h3>
                    <motion.span
                        className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-caption flex-shrink-0"
                        initial={false}
                    >
                        →
                    </motion.span>
                </div>
                <p className="text-small text-secondary mt-1">
                    {category || description}
                </p>
            </div>
        </Link>
    );
}
