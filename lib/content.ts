import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export interface WorkProject {
    slug: string;
    title: string;
    description: string;
    date: string;
    category: string;
    cover: string;
    images: string[];
    featured: boolean;
    order: number;
    content: string;
}

export interface WritingPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    cover: string;
    content: string;
}

export function getWorkProjects(): WorkProject[] {
    const workDir = path.join(contentDirectory, 'work');
    if (!fs.existsSync(workDir)) return [];

    const files = fs.readdirSync(workDir).filter((f) => f.endsWith('.mdx'));

    const projects = files.map((filename) => {
        const slug = filename.replace('.mdx', '');
        const filePath = path.join(workDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        return {
            slug,
            title: data.title || '',
            description: data.description || '',
            date: data.date || '',
            category: data.category || '',
            cover: data.cover || '',
            images: data.images || [],
            featured: data.featured || false,
            order: data.order || 0,
            content,
        };
    });

    return projects.sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects(): WorkProject[] {
    return getWorkProjects().filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): WorkProject | undefined {
    const projects = getWorkProjects();
    return projects.find((p) => p.slug === slug);
}

export function getWritingPosts(): WritingPost[] {
    const writingDir = path.join(contentDirectory, 'writing');
    if (!fs.existsSync(writingDir)) return [];

    const files = fs.readdirSync(writingDir).filter((f) => f.endsWith('.mdx'));

    const posts = files.map((filename) => {
        const slug = filename.replace('.mdx', '');
        const filePath = path.join(writingDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        return {
            slug,
            title: data.title || '',
            date: data.date || '',
            excerpt: data.excerpt || '',
            cover: data.cover || '',
            content,
        };
    });

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): WritingPost | undefined {
    const posts = getWritingPosts();
    return posts.find((p) => p.slug === slug);
}

export function getNextPost(currentSlug: string): WritingPost | undefined {
    const posts = getWritingPosts();
    const currentIndex = posts.findIndex((p) => p.slug === currentSlug);
    if (currentIndex === -1 || currentIndex === posts.length - 1) return undefined;
    return posts[currentIndex + 1];
}
