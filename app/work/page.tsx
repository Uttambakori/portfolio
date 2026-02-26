import { Metadata } from 'next';
import FadeIn from '@/components/FadeIn';
import ProjectCard from '@/components/ProjectCard';
import { getWorkProjects } from '@/lib/content';

export const metadata: Metadata = {
    title: 'Work',
    description: 'Selected design projects.',
};

export default function WorkPage() {
    const projects = getWorkProjects();

    return (
        <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
            <div className="pt-[120px] md:pt-[160px]">
                <FadeIn>
                    <h1 className="font-serif text-page-title-mobile md:text-page-title font-normal">
                        Work
                    </h1>
                    <p className="text-caption text-secondary mt-2">
                        Selected projects, 2023–present
                    </p>
                </FadeIn>
            </div>

            <div className="mt-[60px] grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12 md:gap-y-16">
                {projects.map((project, i) => (
                    <FadeIn key={project.slug} delay={i * 0.1}>
                        <ProjectCard
                            slug={project.slug}
                            title={project.title}
                            description={project.description}
                            cover={project.cover}
                            category={project.category}
                        />
                    </FadeIn>
                ))}
            </div>

            <div className="h-[10vh]" />
        </div>
    );
}
