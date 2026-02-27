import { NextResponse } from 'next/server';
import { verifyPassword, createToken, getAdminPasswordHash, verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        const passwordHash = await getAdminPasswordHash();
        const isValid = await verifyPassword(password, passwordHash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        const token = createToken({ role: 'admin', timestamp: Date.now() });

        const response = NextResponse.json({ success: true });

        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_token');
    return response;
}

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
        return NextResponse.json({ authenticated: false });
    }

    const payload = verifyToken(token);
    return NextResponse.json({ authenticated: payload !== null });
}
