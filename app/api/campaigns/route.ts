import { NextRequest, NextResponse } from "next/server";
import { getDb, nextSequence } from "@/lib/db";
import { getSession } from "@/lib/session";

function fmt(c: any) {
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
    const campaigns = await db.collection("campaigns").find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json(campaigns.map(fmt));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const body = await req.json();
  const { title, titleHindi, description, descriptionHindi, goalAmount, category, imageUrl, isActive } = body;
  if (!title || !description || !goalAmount || !category) {
    return NextResponse.json({ error: "title, description, goalAmount, category are required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const campaign = {
      id: await nextSequence("campaigns"),
      title,
      titleHindi: titleHindi ?? null,
      description,
      descriptionHindi: descriptionHindi ?? null,
      goalAmount: Number(goalAmount),
      raisedAmount: 0,
      category,
      imageUrl: imageUrl ?? null,
      isActive: isActive ?? true,
      donorCount: 0,
      createdAt: new Date(),
    };

    await db.collection("campaigns").insertOne(campaign);
    return NextResponse.json(fmt(campaign), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
