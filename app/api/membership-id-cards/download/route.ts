import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateMembershipIdCardPdf, safeFileName, type MemberDocumentRecord } from "@/lib/membership-documents";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession();

  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const member = await db.collection<MemberDocumentRecord>("members").findOne({ id: session.memberId });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.status !== "active") {
      return NextResponse.json({ error: "Membership ID card is available after activation" }, { status: 403 });
    }

    if (!member.certificateNumber) {
      return NextResponse.json({ error: "Certificate has not been issued yet" }, { status: 404 });
    }

    const pdf = await generateMembershipIdCardPdf(member, req.url);
    const fileName = `${safeFileName(`${member.membershipId || "membership"}-id-card`)}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Failed to download membership ID card:", err);
    return NextResponse.json({ error: "Failed to download membership ID card" }, { status: 500 });
  }
}
