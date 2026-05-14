import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type Context = { params: Promise<{ memberId: string }> };

interface MemberRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  membershipType: string;
  membershipId: string;
  status: string;
  certificateNumber?: string | null;
  joinedAt: string | Date;
}

const allowedStatuses = new Set(["pending", "payment_pending", "active", "suspended", "inactive", "rejected"]);
const allowedMembershipTypes = new Set(["general", "active", "lifetime"]);

function toResponse(member: MemberRecord) {
  return {
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
  };
}

export async function PUT(req: NextRequest, { params }: Context) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const memberId = Number.parseInt((await params).memberId, 10);
  if (Number.isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
  }

  const body = (await req.json()) as { status?: string; membershipType?: string };
  const updates: Partial<Pick<MemberRecord, "status" | "membershipType">> = {};

  if (body.status !== undefined) {
    if (!allowedStatuses.has(body.status)) {
      return NextResponse.json({ error: "Invalid member status" }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.membershipType !== undefined) {
    if (!allowedMembershipTypes.has(body.membershipType)) {
      return NextResponse.json({ error: "Invalid membership type" }, { status: 400 });
    }
    updates.membershipType = body.membershipType;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const updated = await db
      .collection<MemberRecord>("members")
      .findOneAndUpdate({ id: memberId }, { $set: updates }, { returnDocument: "after" });

    if (!updated) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(toResponse(updated));
  } catch (err) {
    console.error("Failed to update member:", err);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}
