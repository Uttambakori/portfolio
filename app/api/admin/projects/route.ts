import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const workDir = path.join(process.cwd(), 'content', 'work');

function ensureDir() {
    if (!fs.existsSync(workDir)) {
        fs.mkdirSync(workDir, { recursive: true });
    }
}

export async function GET() {
    ensureDir();
    const files = fs.readdirSync(workDir).filter((f) => f.endsWith('.mdx'));

    const projects = files.map((filename) => {
        const slug = filename.replace('.mdx', '');
        const filePath = path.join(workDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        return {
            slug,
            title: data.title || '',
            description: data.description || '',
            date: data.date || '',
            category: data.category || '',
            cover: data.cover || '',
            images: data.images || [],
            featured: data.featured || false,
            order: data.order || 0,
            content,
        };
    });

    return NextResponse.json(projects.sort((a, b) => a.order - b.order));
}

export async function POST(request: Request) {
    try {
        ensureDir();
        const data = await request.json();
        const { slug, title, description, date, category, cover, images, featured, order, content } = data;

        if (!slug || !title) {
            return NextResponse.json({ error: 'Slug and title are required' }, { status: 400 });
        }

        const filePath = path.join(workDir, `${slug}.mdx`);

        if (fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Project with this slug already exists' }, { status: 409 });
        }

        const frontmatter = {
            title,
            description: description || '',
            date: date || new Date().toISOString().split('T')[0],
            category: category || '',
            cover: cover || '',
            images: images || [],
            featured: featured || false,
            order: order || 0,
        };

        const fileContent = matter.stringify(content || '', frontmatter);
        fs.writeFileSync(filePath, fileContent, 'utf-8');

        return NextResponse.json({ success: true, slug });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        ensureDir();
        const data = await request.json();
        const { slug, title, description, date, category, cover, images, featured, order, content } = data;

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const filePath = path.join(workDir, `${slug}.mdx`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const frontmatter = {
            title: title || '',
            description: description || '',
            date: date || '',
            category: category || '',
            cover: cover || '',
            images: images || [],
            featured: featured || false,
            order: order || 0,
        };

        const fileContent = matter.stringify(content || '', frontmatter);
        fs.writeFileSync(filePath, fileContent, 'utf-8');

        return NextResponse.json({ success: true, slug });
    } catch (error) {
        console.error('Error updating project:', error);
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

        const filePath = path.join(workDir, `${slug}.mdx`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        fs.unlinkSync(filePath);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
