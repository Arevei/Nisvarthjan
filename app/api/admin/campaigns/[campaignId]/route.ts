import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type Ctx = { params: Promise<{ campaignId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const campaignId = parseInt((await params).campaignId);
  if (isNaN(campaignId)) return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });

  const body = await req.json();
  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.titleHindi !== undefined) updateData.titleHindi = body.titleHindi;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.descriptionHindi !== undefined) updateData.descriptionHindi = body.descriptionHindi;
  if (body.goalAmount !== undefined) updateData.goalAmount = Number(body.goalAmount);
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

  try {
    const db = await getDb();
    const c = await db.collection("campaigns").findOneAndUpdate(
      { id: campaignId },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!c) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    return NextResponse.json({
      id: c.id,
      title: c.title,
      titleHindi: c.titleHindi,
      description: c.description,
      descriptionHindi: c.descriptionHindi,
      goalAmount: Number(c.goalAmount),
      raisedAmount: Number(c.raisedAmount),
      category: c.category,
      imageUrl: c.imageUrl,
      isActive: c.isActive,
      donorCount: c.donorCount,
      createdAt: new Date(c.createdAt).toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}
