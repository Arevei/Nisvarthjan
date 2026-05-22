import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

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
    const member = await db.collection("members").findOne({ id: session.memberId });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 401 });

    const donationRows = await db
      .collection("donations")
      .aggregate<{ totalAmount: number; count: number }>([
        {
          $match: {
            donorEmail: { $regex: `^${escapeRegex(member.email)}$`, $options: "i" },
            $or: [{ status: "paid" }, { "payment.status": "paid" }, { payment: { $exists: false } }],
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    const donationStats = donationRows[0] ?? { totalAmount: 0, count: 0 };

    return NextResponse.json({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth ?? null,
      address: member.address,
      city: member.city,
      state: member.state,
      membershipType: member.membershipType,
      membershipId: member.membershipId,
      status: member.status,
      certificateNumber: member.certificateNumber,
      referral: member.referral ?? null,
      referralAchievement: member.referralAchievement ?? null,
      donationStats: {
        totalAmount: Number(donationStats.totalAmount ?? 0),
        count: Number(donationStats.count ?? 0),
      },
      joinedAt: new Date(member.joinedAt).toISOString(),
    });
  } catch (err) {
    console.error("Failed to get current user:", err);
    return NextResponse.json({ error: "Failed to get current user" }, { status: 500 });
  }
}
