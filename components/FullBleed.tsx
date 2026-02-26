import { ReactNode } from 'react';

interface FullBleedProps {
    children: ReactNode;
    className?: string;
}

export default function FullBleed({ children, className = '' }: FullBleedProps) {
    return (
        <div
            className={`relative w-screen left-1/2 right-1/2 -mx-[50vw] ${className}`}
        >
            <div className="max-w-[1100px] mx-auto px-6 md:px-10">
                {children}
            </div>
        </div>
    );
}
