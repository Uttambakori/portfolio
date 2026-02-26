import { MetadataRoute } from 'next';
import { getWorkProjects, getWritingPosts } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://uttambakori.com';

    const workProjects = getWorkProjects();
    const writingPosts = getWritingPosts();

    const workUrls = workProjects.map((project) => ({
        url: `${baseUrl}/work/${project.slug}`,
        lastModified: new Date(project.date || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    const writingUrls = writingPosts.map((post) => ({
        url: `${baseUrl}/writing/${post.slug}`,
        lastModified: new Date(post.date || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/work`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/writing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        ...workUrls,
        ...writingUrls,
    ];
}
