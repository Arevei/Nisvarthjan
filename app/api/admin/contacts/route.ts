import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const contacts = await db.collection("contacts").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(
      contacts.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        message: c.message,
        createdAt: new Date(c.createdAt).toISOString(),
      })),
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list contacts" }, { status: 500 });
  }
}
