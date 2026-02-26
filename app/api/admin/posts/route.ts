import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const writingDir = path.join(process.cwd(), 'content', 'writing');

function ensureDir() {
    if (!fs.existsSync(writingDir)) {
        fs.mkdirSync(writingDir, { recursive: true });
    }
}

export async function GET() {
    ensureDir();
    const files = fs.readdirSync(writingDir).filter((f) => f.endsWith('.mdx'));

    const posts = files.map((filename) => {
        const slug = filename.replace('.mdx', '');
        const filePath = path.join(writingDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        return {
            slug,
            title: data.title || '',
            date: data.date || '',
            excerpt: data.excerpt || '',
            cover: data.cover || '',
            content,
        };
    });

    return NextResponse.json(
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
}

export async function POST(request: Request) {
    try {
        ensureDir();
        const data = await request.json();
        const { slug, title, date, excerpt, cover, content } = data;

        if (!slug || !title) {
            return NextResponse.json({ error: 'Slug and title are required' }, { status: 400 });
        }

        const filePath = path.join(writingDir, `${slug}.mdx`);

        if (fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Post with this slug already exists' }, { status: 409 });
        }

        const frontmatter = {
            title,
            date: date || new Date().toISOString().split('T')[0],
            excerpt: excerpt || '',
            cover: cover || '',
        };

        const fileContent = matter.stringify(content || '', frontmatter);
        fs.writeFileSync(filePath, fileContent, 'utf-8');

        return NextResponse.json({ success: true, slug });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        ensureDir();
        const data = await request.json();
        const { slug, title, date, excerpt, cover, content } = data;

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const filePath = path.join(writingDir, `${slug}.mdx`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const frontmatter = {
            title: title || '',
            date: date || '',
            excerpt: excerpt || '',
            cover: cover || '',
        };

        const fileContent = matter.stringify(content || '', frontmatter);
        fs.writeFileSync(filePath, fileContent, 'utf-8');

        return NextResponse.json({ success: true, slug });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const filePath = path.join(writingDir, `${slug}.mdx`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        fs.unlinkSync(filePath);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
