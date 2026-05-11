import { getIronSession, IronSession } from "iron-session";
  import { cookies } from "next/headers";

  export interface SessionData {
    memberId?: number;
    isAdmin?: boolean;
    adminEmail?: string;
  }

  const sessionOptions = {
    password: process.env.SESSION_SECRET as string,
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
  