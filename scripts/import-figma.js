/**
 * 🎨 Figma Portfolio Automator
 * Usage: 
 *   1. Add FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY to your .env.local
 *   2. Run: node scripts/import-figma.js
 */

const fs = require('fs');
const path = require('path');

// 1. Load env variables from .env.local
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
    console.error('\x1b[31m%s\x1b[0m', '❌ Error: Missing Figma credentials.');
    console.log('Please add the following variables to your .env.local file:');
    console.log('  FIGMA_ACCESS_TOKEN=your_personal_access_token');
    console.log('  FIGMA_FILE_KEY=your_figma_file_key');
    console.log('\nGet your access token from Figma settings -> Account -> Personal Access Tokens.');
    console.log('Get your file key from your Figma URL: https://www.figma.com/file/FILE_KEY/title...\n');
    process.exit(1);
}

// Helper: Download image from URL and save to path
async function downloadImage(url, destPath) {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destPath, buffer);
}

// Helper: Convert string to slug
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function run() {
    console.log('🚀 Connecting to Figma...');
    const fileUrl = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`;
    
    const res = await fetch(fileUrl, {
        headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN }
    });

    if (!res.ok) {
        console.error('\x1b[31m%s\x1b[0m', `❌ Failed to fetch Figma file. Status: ${res.status}`);
        const text = await res.text();
        console.error(text);
        process.exit(1);
    }

    const fileData = await res.json();
    console.log(`✅ Loaded Figma File: "${fileData.name}"`);

    const pages = fileData.document.children;
    
    // Find designated Pages
    const galleryPage = pages.find(p => 
        p.name.toLowerCase() === 'gallery' || 
        p.name.toLowerCase().includes('visuals')
    );
    const workPage = pages.find(p => 
        p.name.toLowerCase() === 'work' || 
        p.name.toLowerCase() === 'portfolio' ||
        p.name.toLowerCase().includes('ui ux')
    );

    if (!galleryPage && !workPage) {
        console.warn('\x1b[33m%s\x1b[0m', '⚠️ Warning: No page named "Gallery" or "Work"/"Portfolio" found in the Figma file.');
        console.log('Found pages in your Figma file:', pages.map(p => `"${p.name}"`).join(', '));
        console.log('To import items, rename one of your pages to "Gallery" (for individual visual posts) or "Work" (for case studies) in Figma, then run this command again.');
        process.exit(0);
    }

    // 1. Process Gallery Page
    if (galleryPage) {
        console.log('\n📸 Found "Gallery" page. Processing visuals...');
        const frames = galleryPage.children.filter(c => c.type === 'FRAME').slice(0, 10);
        
        if (frames.length === 0) {
            console.log('  No top-level frames found on the Gallery page.');
        } else {
            console.log(`  Found ${frames.length} visuals to import. Exporting images...`);
            
            const frameIds = frames.map(f => f.id);
            const imageUrls = await getFigmaImageUrls(FIGMA_FILE_KEY, frameIds);
            
            // Load existing gallery data
            const galleryJsonPath = path.join(process.cwd(), 'content', 'gallery.json');
            let galleryItems = [];
            if (fs.existsSync(galleryJsonPath)) {
                try {
                    galleryItems = JSON.parse(fs.readFileSync(galleryJsonPath, 'utf8'));
                } catch (e) {
                    console.error('Error reading gallery.json, starting fresh', e);
                }
            }

            for (const frame of frames) {
                const imageUrl = imageUrls[frame.id];
                if (!imageUrl) {
                    console.log(`  ⚠️ Skipping "${frame.name}": could not export image`);
                    continue;
                }

                // Parse frame name format: "Title | Category"
                let title = frame.name;
                let category = 'Digital Art'; // fallback default
                if (frame.name.includes('|')) {
                    const parts = frame.name.split('|');
                    title = parts[0].trim();
                    category = parts[1].trim();
                }

                const slug = slugify(title);
                const ext = 'png';
                const filename = `figma-${slug}-${frame.id.replace(':', '-')}.${ext}`;
                const publicPath = `/gallery/${filename}`;
                const localPath = path.join(process.cwd(), 'public', 'gallery', filename);

                // Check dimensions
                const width = Math.round(frame.absoluteBoundingBox?.width || 1200);
                const height = Math.round(frame.absoluteBoundingBox?.height || 1200);

                console.log(`  📥 Downloading "${title}" [${category}] (${width}x${height})...`);
                await downloadImage(imageUrl, localPath);

                // Update or Add entry
                const itemIndex = galleryItems.findIndex(item => item.id === frame.id);
                const galleryEntry = {
                    id: frame.id,
                    src: publicPath,
                    title,
                    category,
                    width,
                    height
                };

                if (itemIndex > -1) {
                    galleryItems[itemIndex] = galleryEntry;
                } else {
                    galleryItems.unshift(galleryEntry); // add to top
                }
            }

            fs.writeFileSync(galleryJsonPath, JSON.stringify(galleryItems, null, 4), 'utf8');
            console.log(`✅ Gallery successfully updated! (${galleryItems.length} total items)`);
        }
    }

    // 2. Process Work / Portfolio Page
    if (workPage) {
        console.log('\n💼 Found "Work" page. Processing projects...');
        const projects = workPage.children.filter(c => c.type === 'FRAME');

        if (projects.length === 0) {
            console.log('  No top-level frames found on the Work page.');
        } else {
            console.log(`  Found ${projects.length} project frames. Exporting...`);

            // For each project frame:
            // - Look for inner nodes named "cover" or starting with "image-" to export
            // - If not found, export the entire frame as the cover
            for (let index = 0; index < projects.length; index++) {
                const project = projects[index];
                const slug = slugify(project.name);
                const category = 'Visual Design'; // default category

                // Find cover node or export the frame itself
                const coverNode = findNodeByName(project, 'cover') || project;
                const detailNodes = findAllNodesStartingWith(project, 'image-');

                const nodeIds = [coverNode.id, ...detailNodes.map(d => d.id)];
                const imageUrls = await getFigmaImageUrls(FIGMA_FILE_KEY, nodeIds);

                const coverUrl = imageUrls[coverNode.id];
                if (!coverUrl) {
                    console.log(`  ⚠️ Skipping project "${project.name}": could not export cover`);
                    continue;
                }

                // Download cover image
                const localCoverDir = path.join(process.cwd(), 'public', 'work', slug);
                const coverFilename = `cover.png`;
                const publicCoverPath = `/work/${slug}/${coverFilename}`;
                console.log(`  📥 Downloading cover for "${project.name}"...`);
                await downloadImage(coverUrl, path.join(localCoverDir, coverFilename));

                // Download detail images
                const detailImagePaths = [];
                for (let i = 0; i < detailNodes.length; i++) {
                    const node = detailNodes[i];
                    const url = imageUrls[node.id];
                    if (url) {
                        const filename = `detail-${i + 1}.png`;
                        console.log(`  📥 Downloading detail image ${i + 1} for "${project.name}"...`);
                        await downloadImage(url, path.join(localCoverDir, filename));
                        detailImagePaths.push(`/work/${slug}/${filename}`);
                    }
                }

                // Write MDX file
                const mdxPath = path.join(process.cwd(), 'content', 'work', `${slug}.mdx`);
                const existingMetadata = getExistingMetadata(mdxPath);

                const dateString = existingMetadata.date || new Date().toISOString().slice(0, 7); // YYYY-MM
                const description = existingMetadata.description || `A design system and visual exploration for ${project.name}.`;
                
                const frontmatter = `---
title: "${project.name}"
description: "${description}"
date: "${dateString}"
category: "${existingMetadata.category || category}"
cover: "${publicCoverPath}"
images:
${detailImagePaths.map(p => `  - "${p}"`).join('\n')}
featured: ${existingMetadata.featured !== undefined ? existingMetadata.featured : true}
order: ${existingMetadata.order !== undefined ? existingMetadata.order : (index + 1) * 10}
---

${existingMetadata.content || `This project was automatically synchronized from Figma.

Established layouts, visual identity guidelines, and design components. The system is built around high-end modular typography and grid structures.`}
`;

                fs.writeFileSync(mdxPath, frontmatter, 'utf8');
                console.log(`  📄 Created/Updated page: content/work/${slug}.mdx`);
            }
            console.log(`✅ Work projects successfully updated!`);
        }
    }
}

// Fetch URLs for Figma nodes
async function getFigmaImageUrls(fileKey, nodeIds) {
    if (nodeIds.length === 0) return {};
    
    const CHUNK_SIZE = 10;
    const allImages = {};
    
    for (let i = 0; i < nodeIds.length; i += CHUNK_SIZE) {
        // Sleep for 2.5 seconds between requests (except the first one) to avoid rate limits
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        const chunk = nodeIds.slice(i, i + CHUNK_SIZE);
        const idParam = chunk.join(',');
        const url = `https://api.figma.com/v1/images/${fileKey}?ids=${idParam}&format=png&scale=2`;
        
        console.log(`  🔗 Requesting export URLs for batch ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(nodeIds.length / CHUNK_SIZE)}...`);
        
        const res = await fetch(url, {
            headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN }
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to get image URLs from Figma: ${res.statusText} (Status ${res.status}) - ${errorText}`);
        }

        const data = await res.json();
        Object.assign(allImages, data.images || {});
    }

    return allImages;
}

// Find a node by name inside a parent tree (DFS)
function findNodeByName(root, name) {
    if (root.name && root.name.toLowerCase() === name.toLowerCase()) {
        return root;
    }
    if (root.children) {
        for (const child of root.children) {
            const found = findNodeByName(child, name);
            if (found) return found;
        }
    }
    return null;
}

// Find all nodes starting with a prefix inside parent tree
function findAllNodesStartingWith(root, prefix, results = []) {
    if (root.name && root.name.toLowerCase().startsWith(prefix.toLowerCase())) {
        results.push(root);
    }
    if (root.children) {
        for (const child of root.children) {
            findAllNodesStartingWith(child, prefix, results);
        }
    }
    return results;
}

// Extract existing metadata from MDX file if it exists to preserve edits
function getExistingMetadata(filePath) {
    if (!fs.existsSync(filePath)) return {};
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parts = fileContent.split('---');
    
    if (parts.length < 3) return { content: fileContent };

    const yamlStr = parts[1];
    const content = parts.slice(2).join('---').trim();
    const metadata = { content };

    // Simple parser for basic YAML fields
    const lines = yamlStr.split('\n');
    let currentKey = null;
    let listItems = [];

    for (const line of lines) {
        const match = line.match(/^\s*([^:\s]+)\s*:\s*(.*)$/);
        if (match) {
            // Save previous list if any
            if (currentKey && listItems.length > 0) {
                metadata[currentKey] = listItems;
                listItems = [];
            }
            
            const key = match[1];
            let val = match[2].trim();
            
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(val) && val !== '') val = Number(val);
            
            metadata[key] = val;
            currentKey = key;
        } else if (line.trim().startsWith('-') && currentKey) {
            let itemVal = line.replace(/^\s*-\s*/, '').trim();
            if (itemVal.startsWith('"') && itemVal.endsWith('"')) itemVal = itemVal.slice(1, -1);
            if (itemVal.startsWith("'") && itemVal.endsWith("'")) itemVal = itemVal.slice(1, -1);
            listItems.push(itemVal);
        }
    }

    if (currentKey && listItems.length > 0) {
        metadata[currentKey] = listItems;
    }

    return metadata;
}

run().catch(err => {
    console.error('\x1b[31m%s\x1b[0m', '❌ Fatal error in script execution:');
    console.error(err);
});
