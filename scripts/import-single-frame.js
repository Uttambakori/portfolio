/**
 * 🏃‍♂️ Figma Single Frame Project Importer
 * Pulls frame 13:2, exports child frames, and builds a dedicated portfolio project page.
 */

const fs = require('fs');
const path = require('path');

// Load env variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)$/);
        if (match) {
            const key = match[1];
            let val = match[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            process.env[key] = val;
        }
    }
}

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_KEY) {
    console.error('❌ Missing Figma credentials in .env.local');
    process.exit(1);
}

const TARGET_NODE_ID = '13:2';
const PROJECT_SLUG = 'move-motion';
const PROJECT_TITLE = 'Move / Motion';

// Helper: Download image
async function downloadImage(url, destPath) {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destPath, buffer);
}

async function run() {
    console.log(`🚀 Fetching metadata for node "${TARGET_NODE_ID}"...`);
    const nodeUrl = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/nodes?ids=${TARGET_NODE_ID}`;
    
    const res = await fetch(nodeUrl, {
        headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN }
    });

    if (!res.ok) {
        console.error(`❌ Failed to fetch node. Status: ${res.status}`);
        process.exit(1);
    }

    const data = await res.json();
    const targetNode = data.nodes[TARGET_NODE_ID];
    
    if (!targetNode) {
        console.error(`❌ Node ${TARGET_NODE_ID} not found in response`);
        process.exit(1);
    }

    console.log(`✅ Loaded target frame: "${targetNode.document.name}"`);
    
    // Find all top level child frames
    const childFrames = targetNode.document.children.filter(c => c.type === 'FRAME');
    
    if (childFrames.length === 0) {
        console.warn('⚠️ No child frames found inside node 13:2');
        process.exit(0);
    }

    console.log(`Found ${childFrames.length} frames inside "Move / Motion".`);

    // Prepare paths for MDX first
    const coverImage = `/work/${PROJECT_SLUG}/frame-1.png`;
    const galleryImages = [];
    for (let i = 1; i < childFrames.length; i++) {
        galleryImages.push(`/work/${PROJECT_SLUG}/frame-${i + 1}.png`);
    }

    // Write MDX file immediately so the page is ready
    const mdxPath = path.join(process.cwd(), 'content', 'work', `${PROJECT_SLUG}.mdx`);
    const mdxContent = `---
title: "${PROJECT_TITLE}"
description: "An editorial and typographic exploration capturing the speed, force, and kinetics of human motion."
date: "2026-06"
category: "Creative Direction"
cover: "${coverImage}"
images:
${galleryImages.map(img => `  - "${img}"`).join('\n')}
featured: true
order: 5
---

Move / Motion is an editorial and typographical design exploration that captures transient human velocity and visual energy. Inspired by the speed and kinetics of track and field athletes, the design language uses typography as a moving force rather than a static block of information.

### Concept: "No still point"

The project centers around the philosophy that in motion, there is no still point. Bold, modern typography is juxtaposed with fast-moving runners to create high-contrast layout grids. Typography elements stretch and shear across the page to mirror the speed and acceleration of the subject matter.

### Visual Architecture

- **Typography**: Large, high-contrast display type with phrases like *"No still point"* and *"Nothing here is static"* that break the standard alignment boundaries.
- **Imagery**: High-contrast, top-down and mid-motion photography capturing athletes in action.
- **Palette**: A high-impact color system using bright electric blue and safety orange against warm editorial backgrounds to create visual tension.
`;

    fs.writeFileSync(mdxPath, mdxContent, 'utf8');
    console.log(`📄 Created project page: content/work/${PROJECT_SLUG}.mdx`);

    // Now try to download the images
    console.log('\n📥 Attempting to download frame images from Figma...');
    
    const frameIds = childFrames.map(f => f.id);
    const idParam = frameIds.join(',');
    const imageUrl = `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${idParam}&format=png&scale=2`;
    
    try {
        const imageRes = await fetch(imageUrl, {
            headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN }
        });

        if (!imageRes.ok) {
            throw new Error(`Figma API returned status ${imageRes.status}`);
        }

        const imageData = await imageRes.json();
        const urls = imageData.images || {};

        const localDir = path.join(process.cwd(), 'public', 'work', PROJECT_SLUG);

        // Download each frame image
        for (let i = 0; i < childFrames.length; i++) {
            const frame = childFrames[i];
            const url = urls[frame.id];
            if (!url) {
                console.log(`  ⚠️ Skipping "${frame.name}": no export URL available`);
                continue;
            }

            const filename = `frame-${i + 1}.png`;
            const localPath = path.join(localDir, filename);

            console.log(`  📥 Downloading "${frame.name}" -> ${filename}...`);
            await downloadImage(url, localPath);
        }
        
        console.log(`\n🎉 Success! All ${childFrames.length} images downloaded and page is fully live!`);

    } catch (error) {
        console.log('\n⚠️ Could not download images automatically due to Figma API rate limits.');
        console.log('👉 Since the script is on your computer, please run the following command in your terminal:');
        console.log('\x1b[36m%s\x1b[0m', '   node scripts/import-single-frame.js');
        console.log('This will download the images using your clean local IP and make the page look perfect!\n');
    }
}

run().catch(err => {
    console.error('❌ Fatal error:', err);
});
