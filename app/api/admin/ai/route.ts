import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const DESIGN_CATEGORIES = [
    'Brand Identity', 'Logo Design', 'Poster Design', 'Typography',
    'UI/UX Design', 'Web Design', 'Digital Art', 'Illustration',
    'Photography', 'Motion Graphics', 'Packaging Design', 'Print Design',
    'Social Media', 'Editorial Design', 'Icon Design', 'Pattern Design',
    'Infographic', '3D Design', 'Concept Art', 'Character Design'
];

export async function POST(request: Request) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY not configured. Add it to .env.local' },
            { status: 500 }
        );
    }

    try {
        const { imageBase64, mimeType } = await request.json();

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const prompt = `You are a design portfolio categorization expert. Analyze this image and suggest the single most appropriate category from this list: ${DESIGN_CATEGORIES.join(', ')}.

Also suggest a short, descriptive title for this image (2-5 words).

Respond in this exact JSON format only, no other text:
{"category": "Category Name", "title": "Short Title"}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType || 'image/jpeg',
                                    data: imageBase64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 100
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
                category: parsed.category || 'Uncategorized',
                title: parsed.title || ''
            });
        }

        return NextResponse.json({ category: 'Uncategorized', title: '' });
    } catch (error) {
        console.error('AI categorization error:', error);
        return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
    }
}
