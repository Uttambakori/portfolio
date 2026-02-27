import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'uttam-bakori-admin-secret-key-change-me';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const TOKEN_EXPIRY = '7d';

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
