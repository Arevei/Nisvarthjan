import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type AdminRecord = {
  id?: number;
  email: string;
  password?: string;
  passwordHash?: string;
  isActive?: boolean;
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const inputPassword = String(password ?? "").trim();

  if (!normalizedEmail || !inputPassword) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const admin = await db.collection<AdminRecord>("admins").findOne({ email: normalizedEmail });
    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD?.trim();
    const envLoginOk = Boolean(envEmail && envPassword && normalizedEmail === envEmail && inputPassword === envPassword);
    const dbLoginOk = Boolean(
      admin &&
        admin.isActive !== false &&
        (admin.password === inputPassword || admin.passwordHash === inputPassword),
    );

    if (!envLoginOk && !dbLoginOk) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await getSession();
    session.isAdmin = true;
    session.adminEmail = admin?.email ?? normalizedEmail;
    await session.save();

    return NextResponse.json({
      token: Buffer.from(`${normalizedEmail}:${Date.now()}`).toString("base64"),
      isAdmin: true,
    });
  } catch (err) {
    console.error("Admin login failed:", err);
    return NextResponse.json({ error: "Admin login failed" }, { status: 500 });
  }
}
