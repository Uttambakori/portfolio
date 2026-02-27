import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY not configured' },
            { status: 500 }
        );
    }

    try {
        const { content } = await request.json();

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        const prompt = `You are a markdown formatting expert. Take the following raw/unformatted text and convert it into clean, well-structured markdown.

RULES:
- Do NOT change the actual content, words, or meaning — only add proper markdown formatting
- Add appropriate headings (## and ###) to section the content logically
- Format lists as bullet points (- ) or numbered lists (1. ) where appropriate
- Add **bold** for key terms, important words, or emphasis
- Add *italic* where appropriate for subtle emphasis
- If there is tabular data, format it as a proper markdown table
- Add blockquotes (> ) for quotes or notable statements
- Add horizontal rules (---) between major sections if it improves readability
- Clean up extra whitespace and line breaks
- Keep paragraphs properly separated with blank lines
- Do NOT add any content that wasn't in the original text
- Do NOT wrap the output in a code block — return raw markdown only
- Do NOT add a title/heading for the overall content if one isn't clearly present in the text

Here is the raw text to format:

${content}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 8192
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            return NextResponse.json({ error: 'AI formatting failed' }, { status: 500 });
        }

        const data = await response.json();
        const formattedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!formattedText) {
            return NextResponse.json({ error: 'AI returned empty response' }, { status: 500 });
        }

        // Strip wrapping code block if Gemini adds one despite instructions
        let cleaned = formattedText;
        if (cleaned.startsWith('```markdown\n')) {
            cleaned = cleaned.slice('```markdown\n'.length);
        } else if (cleaned.startsWith('```md\n')) {
            cleaned = cleaned.slice('```md\n'.length);
        } else if (cleaned.startsWith('```\n')) {
            cleaned = cleaned.slice('```\n'.length);
        }
        if (cleaned.endsWith('\n```')) {
            cleaned = cleaned.slice(0, -4);
        } else if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
        }

        return NextResponse.json({ formatted: cleaned.trim() });
    } catch (error) {
        console.error('AI format error:', error);
        return NextResponse.json({ error: 'AI formatting failed' }, { status: 500 });
    }
}
