import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getReferralAchievementStats, issueReferralAchievementIfEligible } from "@/lib/referral-achievement-service";
import { hasReferralAchievementTier, referralAchievementTiers } from "@/lib/referral-achievements";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    await issueReferralAchievementIfEligible(db, session.memberId, req.url);

    const [stats, member] = await Promise.all([
      getReferralAchievementStats(db, session.memberId),
      db.collection("members").findOne({ id: session.memberId }),
    ]);

    return NextResponse.json({
      stats,
      currentAchievement: member?.referralAchievement ?? null,
      tiers: referralAchievementTiers.map((tier) => ({
        tier: tier.tier,
        label: tier.label,
        membershipReferralCount: tier.membershipReferralCount,
        donationReferralCount: tier.donationReferralCount,
        thresholdAmount: tier.thresholdAmount,
        unlocked: hasReferralAchievementTier(stats, tier),
      })),
    });
  } catch (error) {
    console.error("Failed to load referral achievement status:", error);
    return NextResponse.json({ error: "Failed to load referral achievement status" }, { status: 500 });
  }
}
