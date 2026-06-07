import { Metadata } from 'next';
import Image from 'next/image';
import FadeIn from '@/components/FadeIn';

export const metadata: Metadata = {
    title: 'About',
    description: 'Visual designer thinking about how things should feel.',
};

export default function AboutPage() {
    return (
        <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
            <div className="pt-[120px] md:pt-[160px]">
                <div className="flex flex-col md:flex-row gap-12 md:gap-0">
                    {/* Image */}
                    <FadeIn className="w-full md:w-[40%]">
                        <div className="bg-image-placeholder rounded-[6px] overflow-hidden aspect-[3/4] relative max-w-[400px]">
                            <Image
                                src="/about/portrait.png"
                                alt="Portrait of Uttam Bakori"
                                fill
                                className="object-cover"
                                quality={90}
                                priority
                            />
                        </div>
                    </FadeIn>

                    {/* Bio */}
                    <FadeIn delay={0.1} className="w-full md:w-[60%] md:pl-20">
                        <div className="max-w-[520px]">
                            <div className="text-body-mobile md:text-body text-primary leading-[1.7] space-y-6">
                                <p>
                                    I&apos;m Uttam Bakori. I&apos;m a visual designer who thinks about how things should feel before I think about how they should look.
                                </p>
                                <p>
                                    My work lives in the space between intention and perception — the gap where typography becomes a voice, and where kinetic motion meets minimalist grids. From editorial systems to brand identities, I specialize in designing structures that feel balanced yet dynamic.
                                </p>
                                <p>
                                    I focus on brand visual systems, creative direction, and digital experiences. My design philosophy is rooted in layout precision, bold typographic hierarchy, and using high-contrast color elements to bring energy to static spaces.
                                </p>
                                <p>
                                    When I&apos;m not designing, I&apos;m exploring new visual frameworks, writing about typography, and thinking about how visual layouts shape the way we understand the world.
                                </p>
                            </div>

                            <div className="mt-10">
                                <a
                                    href="mailto:itsuttampatel@gmail.com"
                                    className="text-body text-link no-underline transition-colors duration-300 hover:text-primary"
                                >
                                    itsuttampatel@gmail.com
                                </a>
                                <div className="mt-3 text-body text-secondary">
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="no-underline text-link transition-colors duration-300 hover:text-primary"
                                    >
                                        Instagram
                                    </a>
                                    <span className="mx-2 text-accent">·</span>
                                    <a
                                        href="https://twitter.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="no-underline text-link transition-colors duration-300 hover:text-primary"
                                    >
                                        Twitter
                                    </a>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>

            <div className="h-[10vh]" />
        </div>
    );
}
