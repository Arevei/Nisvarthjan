import { hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "default_jwt_secret_key_at_least_32_chars";

/**
 * Hashes a plaintext password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

/**
 * Safely compares an input password with a stored bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  
  try {
    return await compare(password, hash);
  } catch (err) {
    console.error("Failed to compare bcrypt password:", err);
    return false;
  }
}

/**
 * Generates a signed JWT token for a member.
 */
export function generateToken(payload: { id: number; email: string }): string {
  return sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies a JWT token and returns its decoded payload, or null if invalid.
 */
export function verifyToken(token: string): { id: number; email: string } | null {
  try {
    const decoded = verify(token, JWT_SECRET);
    if (decoded && typeof decoded === "object" && "id" in decoded && "email" in decoded) {
      return decoded as { id: number; email: string };
    }
    return null;
  } catch (err) {
    return null;
  }
}
