import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const member = await db.collection("members").findOne({ id: session.memberId });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 401 });

    return NextResponse.json({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
      city: member.city,
      state: member.state,
      membershipType: member.membershipType,
      membershipId: member.membershipId,
      status: member.status,
      certificateNumber: member.certificateNumber,
      joinedAt: new Date(member.joinedAt).toISOString(),
    });
  } catch (err) {
    console.error("Failed to get current user:", err);
    return NextResponse.json({ error: "Failed to get current user" }, { status: 500 });
  }
}
