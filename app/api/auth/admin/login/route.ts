import { NextRequest, NextResponse } from "next/server";
  import { getSession } from "@/lib/session";

  const ADMIN_EMAIL = "admin@nisvarthjan.org";
  const ADMIN_PASSWORD = "Admin@NSF2024";

  export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD)
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });

    const token = Buffer.from(`admin:${Date.now()}`).toString("base64");
    const session = await getSession();
    session.isAdmin = true;
    session.adminEmail = email;
    session.memberId = undefined;
    await session.save();

    return NextResponse.json({ token, isAdmin: true });
  }
  