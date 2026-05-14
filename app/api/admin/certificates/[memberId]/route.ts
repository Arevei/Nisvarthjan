import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type Context = { params: Promise<{ memberId: string }> };

interface MemberRecord {
  id: number;
  name: string;
  status: string;
  certificateNumber?: string | null;
}

function generateCertificateNumber() {
  return `CERT-NSF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`;
}

export async function POST(_req: Request, { params }: Context) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const memberId = Number.parseInt((await params).memberId, 10);
  if (Number.isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const members = db.collection<MemberRecord>("members");
    const member = await members.findOne({ id: memberId });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.status !== "active") {
      return NextResponse.json({ error: "Activate membership before issuing certificate" }, { status: 400 });
    }

    const certificateNumber = member.certificateNumber ?? generateCertificateNumber();

    if (!member.certificateNumber) {
      await members.updateOne({ id: memberId }, { $set: { certificateNumber } });
    }

    return NextResponse.json({
      memberId,
      memberName: member.name,
      certificateNumber,
    });
  } catch (err) {
    console.error("Failed to issue certificate:", err);
    return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 });
  }
}
