import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  generateMembershipReceiptPdf,
  getMembershipReceiptNumber,
  safeFileName,
  type MemberDocumentRecord,
} from "@/lib/membership-documents";

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

    if (member.payment?.status !== "paid") {
      return NextResponse.json({ error: "Membership payment receipt is not available" }, { status: 403 });
    }

    const pdf = await generateMembershipReceiptPdf(member, req.url);
    const fileName = `${safeFileName(getMembershipReceiptNumber(member))}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Failed to download membership receipt:", err);
    return NextResponse.json({ error: "Failed to download membership receipt" }, { status: 500 });
  }
}
