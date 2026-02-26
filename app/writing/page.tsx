import { Metadata } from 'next';
import FadeIn from '@/components/FadeIn';
import WritingEntry from '@/components/WritingEntry';
import { getWritingPosts } from '@/lib/content';

export const metadata: Metadata = {
    title: 'Writing',
    description: 'Thoughts on design, seeing, and how things should feel.',
};

export default function WritingPage() {
    const posts = getWritingPosts();

    return (
        <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
            <div className="pt-[120px] md:pt-[160px]">
                <FadeIn>
                    <h1 className="font-serif text-page-title-mobile md:text-page-title font-normal">
                        Writing
                    </h1>
                    <p className="text-caption text-secondary mt-2">
                        Thoughts on design, seeing, and how things should feel.
                    </p>
                </FadeIn>
            </div>

            <div className="mt-[60px] max-w-image mx-auto">
                {posts.map((post, i) => (
                    <FadeIn key={post.slug} delay={i * 0.1}>
                        <WritingEntry
                            slug={post.slug}
                            title={post.title}
                            date={post.date}
                            excerpt={post.excerpt}
                            index={i}
                            showSeparator={i < posts.length - 1}
                        />
                    </FadeIn>
                ))}
            </div>

            <div className="h-[10vh]" />
        </div>
    );
}
