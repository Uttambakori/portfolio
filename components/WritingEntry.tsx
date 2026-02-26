import Link from 'next/link';

interface WritingEntryProps {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    index?: number;
    showSeparator?: boolean;
}

export default function WritingEntry({
    slug,
    title,
    date,
    index = 0,
    showSeparator = true,
}: WritingEntryProps) {
    const formatYear = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.getFullYear().toString();
    };

    const padIndex = (i: number) => String(i + 1).padStart(2, '0');

    return (
        <div>
            <Link
                href={`/writing/${slug}`}
                className="block no-underline group py-6"
            >
                <div className="flex items-baseline gap-6 md:gap-10">
                    {/* Index number */}
                    <span className="font-mono text-small text-accent shrink-0">
                        {padIndex(index)}
                    </span>

                    {/* Title — large serif, dominant */}
                    <h3 className="font-serif text-[22px] md:text-[32px] text-primary font-normal leading-[1.2] transition-colors duration-300 group-hover:text-link flex-1">
                        {title}
                    </h3>

                    {/* Year — right-aligned, subtle */}
                    <span className="font-mono text-small text-secondary shrink-0 hidden md:block">
                        {formatYear(date)}
                    </span>

                    {/* Arrow */}
                    <span className="text-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 text-[18px] shrink-0">
                        →
                    </span>
                </div>
            </Link>
            {showSeparator && (
                <div className="border-t border-accent-secondary/50" />
            )}
        </div>
    );
}
