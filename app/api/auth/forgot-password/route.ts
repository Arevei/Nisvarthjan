import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

type MemberWithReset = {
  id: number;
  name?: string;
  email?: string;
  passwordReset?: {
    tokenHash?: string;
    expiresAt?: Date;
    createdAt?: Date;
  };
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
}

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email?: string };
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const members = db.collection<MemberWithReset>("members");
    const member = await members.findOne({ email: normalizedEmail });

    if (member) {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await members.updateOne(
        { id: member.id },
        {
          $set: {
            passwordReset: {
              tokenHash: hashToken(token),
              expiresAt,
              createdAt: new Date(),
            },
          },
        },
      );

      const resetUrl = `${getBaseUrl(req)}/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail(member, resetUrl, req.url);
    }

    return NextResponse.json({
      ok: true,
      message: "If this email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Failed to request password reset:", error);
    return NextResponse.json({ error: "Failed to send reset link" }, { status: 500 });
  }
}
