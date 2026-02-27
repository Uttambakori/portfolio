import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import FadeIn from '@/components/FadeIn';
import { mdxComponents } from '@/components/MDXComponents';
import { getWorkProjects, getProjectBySlug } from '@/lib/content';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const projects = getWorkProjects();
    return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const project = getProjectBySlug(slug);
    if (!project) return {};
    return {
        title: project.title,
        description: project.description,
        openGraph: {
            title: project.title,
            description: project.description,
            images: [project.cover],
        },
    };
}

export default async function ProjectPage({ params }: Props) {
    const { slug } = await params;
    const project = getProjectBySlug(slug);
    if (!project) notFound();

    return (
        <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
            {/* Back link */}
            <div className="pt-[100px]">
                <Link
                    href="/work"
                    className="text-small text-secondary no-underline transition-colors duration-300 hover:text-primary"
                >
                    ← Back to Work
                </Link>
            </div>

            <div className="pt-[80px] max-w-image mx-auto">
                <FadeIn>
                    <h1 className="font-serif text-[32px] md:text-[40px] text-primary font-normal">
                        {project.title}
                    </h1>
                    <p className="mt-3 text-small text-secondary uppercase">
                        {project.category}
                        <span className="font-mono"> · {project.date.slice(0, 4)}</span>
                    </p>
                </FadeIn>

                <div className="mt-12 space-y-8">
                    {/* Project images */}
                    {project.images.map((img, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div className="bg-image-placeholder rounded-[4px] overflow-hidden">
                                <Image
                                    src={img}
                                    alt={`${project.title} - Image ${i + 1}`}
                                    width={900}
                                    height={600}
                                    className="w-full h-auto"
                                    quality={90}
                                    priority={i === 0}
                                />
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* MDX Content */}
                {project.content && (
                    <FadeIn>
                        <div className="mt-16 max-w-text mx-auto prose">
                            <MDXRemote source={project.content} components={mdxComponents} />
                        </div>
                    </FadeIn>
                )}
            </div>

            <div className="h-[10vh]" />
        </div>
    );
}
