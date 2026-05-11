import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type Ctx = { params: Promise<{ memberId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const memberId = parseInt((await params).memberId);
  if (isNaN(memberId)) return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });

  const { status, membershipType } = await req.json();
  const updateData: Record<string, string> = {};
  if (status) updateData.status = status;
  if (membershipType) updateData.membershipType = membershipType;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const member = await db.collection("members").findOneAndUpdate(
      { id: memberId },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

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
    console.error(err);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}
