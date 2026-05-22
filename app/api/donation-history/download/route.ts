import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateDonationHistoryPdf, safeFileName, type DonationHistoryRecord } from "@/lib/donation-history";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

type MemberDoc = {
  id: number;
  name: string;
  email: string;
  membershipId?: string;
};

type CampaignDoc = {
  id: number;
  title: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET() {
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const member = await db.collection<MemberDoc>("members").findOne({ id: session.memberId });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const donations = await db
      .collection<DonationHistoryRecord>("donations")
      .find({
        donorEmail: { $regex: `^${escapeRegex(member.email)}$`, $options: "i" },
        $or: [{ status: "paid" }, { "payment.status": "paid" }, { payment: { $exists: false } }],
      })
      .sort({ createdAt: -1 })
      .toArray();
    const campaignIds = Array.from(new Set(donations.map((donation) => donation.campaignId).filter(Boolean))) as number[];
    const campaigns =
      campaignIds.length > 0
        ? await db.collection<CampaignDoc>("campaigns").find({ id: { $in: campaignIds } }).toArray()
        : [];
    const campaignTitleById = new Map(campaigns.map((campaign) => [campaign.id, campaign.title]));
    const donationsWithCampaigns = donations.map((donation) => ({
      ...donation,
      campaignTitle: donation.campaignId ? campaignTitleById.get(donation.campaignId) ?? null : null,
    }));

    const pdf = generateDonationHistoryPdf(donationsWithCampaigns, member.name, member.email);

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName(`${member.membershipId ?? member.id}-donation-history`)}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Failed to download donation history:", error);
    return NextResponse.json({ error: "Failed to download donation history" }, { status: 500 });
  }
}
