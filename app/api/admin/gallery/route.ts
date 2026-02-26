import { NextResponse } from 'next/server';
import { getGalleryItems, saveGalleryItems, GalleryItem } from '@/lib/gallery';

export async function GET() {
    const items = getGalleryItems();
    return NextResponse.json(items);
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { src, title, category, width, height } = data;

        if (!src) {
            return NextResponse.json({ error: 'Image source is required' }, { status: 400 });
        }

        const items = getGalleryItems();
        const newItem: GalleryItem = {
            id: Date.now().toString(),
            src,
            title: title || '',
            category: category || 'Uncategorized',
            width: width || 800,
            height: height || 800,
        };

        items.push(newItem);
        saveGalleryItems(items);

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error adding gallery item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, src, title, category, width, height } = data;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const items = getGalleryItems();
        const index = items.findIndex((item) => item.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        items[index] = {
            ...items[index],
            src: src || items[index].src,
            title: title ?? items[index].title,
            category: category || items[index].category,
            width: width || items[index].width,
            height: height || items[index].height,
        };

        saveGalleryItems(items);

        return NextResponse.json({ success: true, item: items[index] });
    } catch (error) {
        console.error('Error updating gallery item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const items = getGalleryItems();
        const filtered = items.filter((item) => item.id !== id);

        if (filtered.length === items.length) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        saveGalleryItems(filtered);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
