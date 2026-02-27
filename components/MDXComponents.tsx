/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import FullBleed from './FullBleed';
import React from 'react';

function MdxImage({ src, alt, caption }: { src: string; alt?: string; caption?: string }) {
    return (
        <figure className="my-8">
            <div className="max-w-image mx-auto bg-image-placeholder rounded-[4px] overflow-hidden">
                <Image
                    src={src}
                    alt={alt || ''}
                    width={900}
                    height={600}
                    className="w-full h-auto"
                    quality={90}
                />
            </div>
            {(caption || alt) && (
                <figcaption className="text-caption text-secondary text-center mt-3">
                    {caption || alt}
                </figcaption>
            )}
        </figure>
    );
}

function PdfLink({ href, children }: { href: string; children?: React.ReactNode }) {
    const filename = href.split('/').pop() || 'Document';
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-4 bg-image-placeholder rounded-[6px] no-underline
                border border-accent-secondary hover:border-link transition-colors my-6 group"
        >
            <span className="text-[24px]">📄</span>
            <span className="flex-1">
                <span className="text-primary text-[15px] block group-hover:text-link transition-colors">
                    {children || filename}
                </span>
                <span className="text-secondary text-caption">PDF · Click to open</span>
            </span>
            <span className="text-secondary text-[13px] group-hover:text-link transition-colors">↗</span>
        </a>
    );
}

function FigmaEmbed({ src }: { src: string }) {
    const embedUrl = src.includes('figma.com/embed')
        ? src
        : `https://www.figma.com/embed?embed_host=portfolio&url=${encodeURIComponent(src)}`;

    return (
        <figure className="my-8">
            <div className="w-full rounded-[6px] overflow-hidden border border-accent-secondary bg-image-placeholder">
                <iframe
                    src={embedUrl}
                    className="w-full border-none"
                    style={{ height: '500px' }}
                    allowFullScreen
                />
            </div>
            <figcaption className="text-caption text-secondary text-center mt-3">
                Figma Design
            </figcaption>
        </figure>
    );
}

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;
type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement>;
type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>;
type CodeProps = React.HTMLAttributes<HTMLElement>;
type PreProps = React.HTMLAttributes<HTMLPreElement>;

export const mdxComponents = {
    h1: (props: HeadingProps) => (
        <h1 className="font-serif text-page-title-mobile md:text-page-title font-normal mt-16 mb-6" {...props} />
    ),
    h2: (props: HeadingProps) => (
        <h2 className="font-serif text-section-heading-mobile md:text-section-heading font-normal mt-12 mb-4" {...props} />
    ),
    h3: (props: HeadingProps) => (
        <h3 className="font-serif text-[22px] md:text-[24px] font-normal mt-10 mb-3" {...props} />
    ),
    p: (props: ParagraphProps) => (
        <p className="mb-6 leading-[1.8]" {...props} />
    ),
    a: (props: AnchorProps) => {
        // Check if it's a PDF link
        const href = props.href || '';
        if (href.endsWith('.pdf') || (typeof props.children === 'string' && props.children.includes('(PDF)'))) {
            return <PdfLink href={href}>{props.children}</PdfLink>;
        }
        return (
            <a
                className="text-link underline underline-offset-[3px] decoration-accent transition-colors duration-300 hover:text-primary"
                {...props}
            />
        );
    },
    blockquote: (props: BlockquoteProps) => (
        <blockquote
            className="border-l-2 border-accent-secondary pl-6 italic text-secondary my-6"
            {...props}
        />
    ),
    ul: (props: ListProps) => <ul className="pl-6 mb-6 list-disc" {...props} />,
    ol: (props: ListProps) => <ol className="pl-6 mb-6 list-decimal" {...props} />,
    li: (props: ListItemProps) => <li className="mb-2" {...props} />,
    hr: () => <hr className="border-t border-accent-secondary my-12" />,
    code: (props: CodeProps) => (
        <code className="font-mono text-[0.9em] bg-image-placeholder px-1.5 py-0.5 rounded" {...props} />
    ),
    pre: (props: PreProps) => (
        <pre className="bg-image-placeholder p-6 rounded-[4px] overflow-x-auto my-6" {...props} />
    ),
    img: (props: any) => <MdxImage src={props.src} alt={props.alt} />,
    Image: MdxImage,
    FullBleed,
    PdfLink,
    FigmaEmbed,
    // Handle div elements that may contain figma embeds
    div: (props: any) => {
        if (props.className === 'figma-embed') {
            const iframe = React.Children.toArray(props.children).find(
                (child: any) => child?.type === 'iframe'
            ) as any;
            if (iframe?.props?.src) {
                return <FigmaEmbed src={iframe.props.src} />;
            }
        }
        return <div {...props} />;
    },
};
