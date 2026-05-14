import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  memberId?: number;
  isAdmin?: boolean;
  adminEmail?: string;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add a 32+ character secret to .env.local or your deployment environment.",
    );
  }

  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long for iron-session.");
  }

  return secret;
}

const sessionOptions = {
  password: getSessionSecret(),
  cookieName: "nsf_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
