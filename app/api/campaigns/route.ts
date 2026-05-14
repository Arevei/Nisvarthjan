import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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

export async function GET() {
  try {
    const db = await getDb();
    const campaigns = await db.collection<CampaignDoc>("campaigns").find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json(campaigns.map(fmt));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list campaigns" }, { status: 500 });
  }
}
