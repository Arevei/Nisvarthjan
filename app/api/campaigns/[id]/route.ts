import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

type CampaignDoc = {
  id: number;
  title: string;
  titleHindi?: string | null;
  description: string;
  descriptionHindi?: string | null;
  goalAmount: number;
  raisedAmount?: number;
  category: string;
  imageUrl?: string | null;
  isActive: boolean;
  donorCount?: number;
  createdAt: Date | string;
};

function fmt(c: CampaignDoc) {
  return {
    id: c.id,
    title: c.title,
    titleHindi: c.titleHindi ?? null,
    description: c.description,
    descriptionHindi: c.descriptionHindi ?? null,
    goalAmount: Number(c.goalAmount),
    raisedAmount: Number(c.raisedAmount ?? 0),
    category: c.category,
    imageUrl: c.imageUrl ?? null,
    isActive: Boolean(c.isActive),
    donorCount: Number(c.donorCount ?? 0),
    createdAt: new Date(c.createdAt).toISOString(),
  };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const db = await getDb();
    const campaign = await db.collection<CampaignDoc>("campaigns").findOne({ id });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json(fmt(campaign));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get campaign" }, { status: 500 });
  }
}
