import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type MemberWithReset = {
  id: number;
  password?: string;
  passwordHash?: string;
  passwordReset?: {
    tokenHash?: string;
    expiresAt?: Date | string;
  };
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  const { token, password } = (await req.json()) as { token?: string; password?: string };
  const resetToken = String(token ?? "").trim();
  const newPassword = String(password ?? "");

  if (!resetToken || newPassword.length < 6) {
    return NextResponse.json({ error: "Token and a password of at least 6 characters are required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const members = db.collection<MemberWithReset>("members");
    const member = await members.findOne({ "passwordReset.tokenHash": hashToken(resetToken) });

    if (!member?.passwordReset?.expiresAt || new Date(member.passwordReset.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Reset link is invalid or expired" }, { status: 400 });
    }

    await members.updateOne(
      { id: member.id },
      {
        $set: { password: newPassword },
        $unset: { passwordHash: "", passwordReset: "" },
      },
    );

    return NextResponse.json({ ok: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Failed to reset password:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
