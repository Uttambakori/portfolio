import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import FadeIn from '@/components/FadeIn';
import { mdxComponents } from '@/components/MDXComponents';
import { getWritingPosts, getPostBySlug, getNextPost } from '@/lib/content';

interface Props {
    params: { slug: string };
}

export async function generateStaticParams() {
    const posts = getWritingPosts();
    return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = getPostBySlug(params.slug);
    if (!post) return {};
    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
        },
    };
}

export default function PostPage({ params }: Props) {
    const post = getPostBySlug(params.slug);
    if (!post) notFound();

    const nextPost = getNextPost(params.slug);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // JSON-LD structured data for article
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: {
            '@type': 'Person',
            name: 'Uttam Bakori',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
                {/* Back link */}
                <div className="pt-[100px]">
                    <Link
                        href="/writing"
                        className="text-small text-secondary no-underline transition-colors duration-300 hover:text-primary"
                    >
                        ← Back to Writing
                    </Link>
                </div>

                <div className="pt-[80px] max-w-text mx-auto">
                    <FadeIn>
                        <p className="font-mono text-small text-secondary mb-4">
                            {formatDate(post.date)}
                        </p>
                        <h1 className="font-serif text-[28px] md:text-[40px] text-primary font-normal leading-tight">
                            {post.title}
                        </h1>
                    </FadeIn>

                    {post.cover && (
                        <FadeIn delay={0.1}>
                            <div className="mt-10 -mx-6 md:mx-0 overflow-hidden rounded-none md:rounded-[6px] aspect-[16/9] relative bg-image-placeholder">
                                <Image
                                    src={post.cover}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    quality={90}
                                    priority
                                />
                            </div>
                        </FadeIn>
                    )}

                    <FadeIn delay={post.cover ? 0.15 : 0.1}>
                        <div className="mt-10 prose">
                            <MDXRemote source={post.content} components={mdxComponents} />
                        </div>
                    </FadeIn>

                    {/* Next post */}
                    {nextPost && (
                        <FadeIn>
                            <div className="mt-20 pt-10 border-t border-accent-secondary">
                                <Link
                                    href={`/writing/${nextPost.slug}`}
                                    className="block no-underline group"
                                >
                                    <p className="text-small text-secondary mb-2">Next</p>
                                    <p className="font-serif text-xl text-primary transition-colors duration-300 group-hover:text-link">
                                        {nextPost.title}
                                    </p>
                                </Link>
                            </div>
                        </FadeIn>
                    )}
                </div>

                <div className="h-[10vh]" />
            </div>
        </>
    );
}
