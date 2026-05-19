import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateReferralAchievementCertificatePdf, safeFileName, type ReferralAchievementMember } from "@/lib/referral-achievements";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = await getDb();
  const member = await db.collection<ReferralAchievementMember>("members").findOne({ id: session.memberId });
  if (!member?.referralAchievement) {
    return NextResponse.json({ error: "Referral achievement certificate not found" }, { status: 404 });
  }

  const pdf = await generateReferralAchievementCertificatePdf(member, req.url);
  const filename = `${safeFileName(member.referralAchievement.certificateNumber)}.pdf`;

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
