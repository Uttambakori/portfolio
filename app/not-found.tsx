import Link from 'next/link';
import FadeIn from '@/components/FadeIn';

export default function NotFound() {
    return (
        <div className="max-w-layout mx-auto px-6 md:px-10 lg:px-16">
            <div className="h-[30vh]" />

            <FadeIn>
                <div className="text-center">
                    <h1 className="font-serif text-[64px] md:text-[96px] text-primary font-normal tracking-tight">
                        404
                    </h1>
                    <p className="mt-4 text-body-mobile md:text-body text-secondary">
                        This page doesn&apos;t exist — or maybe it never did.
                    </p>
                    <Link
                        href="/"
                        className="inline-block mt-8 text-small text-secondary uppercase tracking-[0.05em] no-underline transition-colors duration-300 hover:text-primary border-b border-accent-secondary pb-1"
                    >
                        ← Go Home
                    </Link>
                </div>
            </FadeIn>

            <div className="h-[30vh]" />
        </div>
    );
}
