import { NextRequest, NextResponse } from "next/server";
import type { WithId } from "mongodb";
import { getDb, nextSequence } from "@/lib/db";
import { getSession } from "@/lib/session";

type GalleryDoc = {
  id: number;
  imageUrl: string;
  caption?: string | null;
  captionHindi?: string | null;
  category: string;
  createdAt: Date | string;
};

function fmt(g: WithId<GalleryDoc> | GalleryDoc) {
  return {
    id: g.id,
    imageUrl: g.imageUrl,
    caption: g.caption ?? null,
    captionHindi: g.captionHindi ?? null,
    category: g.category,
    createdAt: new Date(g.createdAt).toISOString(),
  };
}

export async function GET() {
  try {
    const db = await getDb();
    const images = await db.collection<GalleryDoc>("gallery").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(images.map(fmt));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list gallery images" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const body = await req.json();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const category = String(body.category ?? "general").trim() || "general";
  const caption = String(body.caption ?? "").trim();
  const captionHindi = String(body.captionHindi ?? "").trim();

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const item: GalleryDoc = {
      id: await nextSequence("gallery"),
      imageUrl,
      caption: caption || null,
      captionHindi: captionHindi || null,
      category,
      createdAt: new Date(),
    };

    await db.collection<GalleryDoc>("gallery").insertOne(item);
    return NextResponse.json(fmt(item), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 });
  }
}
