import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const [totalMembers, donationsAgg, activeCampaigns] = await Promise.all([
      db.collection("members").countDocuments(),
      db.collection("donations").aggregate([
        { $match: { $or: [{ "payment.status": "paid" }, { payment: { $exists: false } }] } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).toArray(),
      db.collection("campaigns").countDocuments({ isActive: true }),
    ]);

    return NextResponse.json({
      totalMembers,
      totalDonations: Number(donationsAgg[0]?.total ?? 0),
      activeCampaigns,
      livesImpacted: 15000,
      villagesCovered: 120,
      healthCampsOrganized: 85,
      treesPlanted: 50000,
      scholarshipsGiven: 320,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
