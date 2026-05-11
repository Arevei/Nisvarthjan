import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const certificateNumber = searchParams.get("certificateNumber");
  const contact = searchParams.get("contact");

  if (!certificateNumber) {
    return NextResponse.json({ error: "certificateNumber is required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const member = await db.collection("members").findOne({ certificateNumber });

    if (!member) {
      return NextResponse.json({ isValid: false, certificateNumber, status: "not_found" });
    }

    if (contact && member.email !== contact && member.phone !== contact) {
      return NextResponse.json({ isValid: false, certificateNumber, status: "not_found" });
    }

    return NextResponse.json({
      isValid: member.status === "active",
      certificateNumber,
      memberName: member.name,
      membershipType: member.membershipType,
      issuedAt: new Date(member.joinedAt).toISOString(),
      status: member.status,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to verify certificate" }, { status: 500 });
  }
}
