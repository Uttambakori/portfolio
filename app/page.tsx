import Link from 'next/link';
import Image from 'next/image';
import FadeIn from '@/components/FadeIn';
import WritingEntry from '@/components/WritingEntry';
import MagneticName from '@/components/MagneticName';
import { getFeaturedProjects, getWritingPosts } from '@/lib/content';

export default function HomePage() {
  const featuredProjects = getFeaturedProjects().slice(0, 4);
  const recentPosts = getWritingPosts().slice(0, 3);

  return (
    <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
      {/* Hero — extra top padding to account for fixed nav */}
      <div className="h-[35vh]" />

      <FadeIn>
        <div className="text-center">
          <MagneticName />
          <p className="mt-6 text-body-mobile md:text-body text-secondary">
            Visual designer. Occasionally writes.
          </p>
          <p className="mt-4 text-caption text-secondary/70">
            Based in Tokyo, thinking about how things should feel.
          </p>
        </div>
      </FadeIn>

      <div className="h-[20vh]" />

      {/* Selected Work */}
      <FadeIn>
        <p className="text-small text-secondary uppercase mb-10">
          Selected Work
        </p>
      </FadeIn>

      <div className="space-y-[60px] max-w-image mx-auto">
        {featuredProjects.map((project, i) => (
          <FadeIn key={project.slug} delay={i * 0.1}>
            <Link href={`/work/${project.slug}`} className="block group no-underline">
              <div className="overflow-hidden rounded-[6px] bg-image-placeholder aspect-[16/10] relative">
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 900px"
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
                  quality={90}
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl text-primary transition-colors duration-300 group-hover:text-link">
                    {project.title}
                  </h3>
                  <p className="text-caption text-secondary mt-1">
                    {project.description}
                  </p>
                </div>
                <span className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-caption flex-shrink-0">
                  →
                </span>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>

      {/* View All Work CTA */}
      <FadeIn>
        <div className="mt-12 text-center">
          <Link
            href="/work"
            className="inline-block text-small text-secondary uppercase tracking-[0.05em] no-underline transition-colors duration-300 hover:text-primary border-b border-accent-secondary pb-1"
          >
            View All Work →
          </Link>
        </div>
      </FadeIn>

      <div className="h-[20vh]" />

      {/* Recent Writing */}
      <FadeIn>
        <p className="text-small text-secondary uppercase mb-10">
          Recent Writing
        </p>
      </FadeIn>

      <div className="max-w-image mx-auto">
        {recentPosts.map((post, i) => (
          <FadeIn key={post.slug} delay={i * 0.1}>
            <WritingEntry
              slug={post.slug}
              title={post.title}
              date={post.date}
              excerpt={post.excerpt}
              index={i}
              showSeparator={i < recentPosts.length - 1}
            />
          </FadeIn>
        ))}
      </div>

      {/* View All Writing CTA */}
      <FadeIn>
        <div className="mt-12 text-center">
          <Link
            href="/writing"
            className="inline-block text-small text-secondary uppercase tracking-[0.05em] no-underline transition-colors duration-300 hover:text-primary border-b border-accent-secondary pb-1"
          >
            View All Writing →
          </Link>
        </div>
      </FadeIn>

      <div className="h-[10vh]" />
    </div>
  );
}
