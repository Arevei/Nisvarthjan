import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const db = await getDb();
    const member = await db.collection("members").findOne({ id });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    return NextResponse.json({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address ?? null,
      city: member.city ?? null,
      state: member.state ?? null,
      membershipType: member.membershipType,
      membershipId: member.membershipId,
      status: member.status,
      certificateNumber: member.certificateNumber ?? null,
      joinedAt: new Date(member.joinedAt).toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get member" }, { status: 500 });
  }
}
