import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('file') as File[];
        const folder = (formData.get('folder') as string) || 'uploads';

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file types
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
            'application/pdf'
        ];

        const uploadDir = path.join(process.cwd(), 'public', folder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const results: { success: boolean; path: string; filename: string; type: string }[] = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                results.push({ success: false, path: '', filename: file.name, type: file.type });
                continue;
            }

            // Max 10MB per file
            if (file.size > 10 * 1024 * 1024) {
                results.push({ success: false, path: '', filename: file.name, type: file.type });
                continue;
            }

            const ext = file.name.split('.').pop() || 'jpg';
            const timestamp = Date.now();
            const safeName = file.name
                .replace(/\.[^/.]+$/, '')
                .replace(/[^a-z0-9]/gi, '-')
                .toLowerCase();
            const filename = `${safeName}-${timestamp}.${ext}`;

            const filePath = path.join(uploadDir, filename);
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            fs.writeFileSync(filePath, buffer);

            const publicPath = `/${folder}/${filename}`;
            results.push({ success: true, path: publicPath, filename, type: file.type });
        }

        // For backwards compatibility, if single file uploaded, return single object format too
        if (results.length === 1) {
            return NextResponse.json({
                success: results[0].success,
                path: results[0].path,
                filename: results[0].filename,
                results
            });
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
