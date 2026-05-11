import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type Ctx = { params: Promise<{ memberId: string }> };

function generateCertificateNumber() {
  return `CERT-NSF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`;
}

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const memberId = parseInt((await params).memberId);
  if (isNaN(memberId)) return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });

  try {
    const db = await getDb();
    const existing = await db.collection("members").findOne({ id: memberId });
    if (!existing) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const certificateNumber = generateCertificateNumber();
    await db.collection("members").updateOne({ id: memberId }, { $set: { certificateNumber } });

    return NextResponse.json({ memberId, memberName: existing.name, certificateNumber });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 });
  }
}
