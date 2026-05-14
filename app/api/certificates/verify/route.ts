import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type MemberVerificationDoc = {
  name?: string;
  email?: string;
  phone?: string;
  membershipType?: string;
  membershipId?: string;
  status?: string;
  certificateNumber?: string;
  joinedAt?: Date | string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const certificateNumber = searchParams.get("certificateNumber")?.trim();
  const verificationId = searchParams.get("verificationId")?.trim();
  const documentType = searchParams.get("documentType")?.trim() || "membership-certificate";
  const contact = searchParams.get("contact")?.trim();
  const lookupValue = certificateNumber || verificationId;

  if (!lookupValue) {
    return NextResponse.json({ error: "certificateNumber or verificationId is required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const member = await db.collection<MemberVerificationDoc>("members").findOne({ certificateNumber: lookupValue });

    if (!member) {
      return NextResponse.json({
        isValid: false,
        documentType,
        verificationId: lookupValue,
        certificateNumber: lookupValue,
        status: "not_found",
      });
    }

    if (contact && member.email !== contact && member.phone !== contact) {
      return NextResponse.json({
        isValid: false,
        documentType,
        verificationId: lookupValue,
        certificateNumber: lookupValue,
        status: "not_found",
      });
    }

    return NextResponse.json({
      isValid: member.status === "active",
      documentType,
      verificationId: lookupValue,
      certificateNumber: member.certificateNumber ?? lookupValue,
      memberName: member.name,
      membershipId: member.membershipId,
      membershipType: member.membershipType,
      issuedAt: member.joinedAt ? new Date(member.joinedAt).toISOString() : null,
      status: member.status,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to verify certificate" }, { status: 500 });
  }
}
