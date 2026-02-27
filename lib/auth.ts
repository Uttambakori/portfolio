import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'uttam-bakori-admin-secret-key-change-me';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const TOKEN_NAME = 'admin_token';
const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function createToken(payload: Record<string, unknown>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): Record<string, unknown> | null {
    try {
        return jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export async function getAdminPasswordHash(): Promise<string> {
    if (ADMIN_PASSWORD_HASH) {
        return ADMIN_PASSWORD_HASH;
    }
    // Default password: "admin123" — CHANGE THIS via ADMIN_PASSWORD_HASH env var
    return bcrypt.hash('admin123', 12);
}

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(TOKEN_NAME)?.value;
}

export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
    const token = await getAuthToken();
    if (!token) return false;
    return verifyToken(token) !== null;
}
