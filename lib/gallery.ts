import fs from 'fs';
import path from 'path';

const galleryPath = path.join(process.cwd(), 'content', 'gallery.json');

export interface GalleryItem {
    id: string;
    src: string;
    title: string;
    category: string;
    width: number;
    height: number;
}

export function getGalleryItems(): GalleryItem[] {
    if (!fs.existsSync(galleryPath)) return [];
    const raw = fs.readFileSync(galleryPath, 'utf-8');
    try {
        return JSON.parse(raw) as GalleryItem[];
    } catch {
        return [];
    }
}

export function saveGalleryItems(items: GalleryItem[]) {
    fs.writeFileSync(galleryPath, JSON.stringify(items, null, 4), 'utf-8');
}
