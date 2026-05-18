import { NextResponse } from "next/server";
import type { WithId } from "mongodb";
import { getDb } from "@/lib/db";

type GalleryDoc = {
  id: number;
  imageUrl: string;
  caption?: string | null;
  captionHindi?: string | null;
  detailsEn?: string | null;
  detailsHi?: string | null;
  category: string;
  createdAt: Date | string;
};

function fmt(g: WithId<GalleryDoc> | GalleryDoc) {
  return {
    id: g.id,
    imageUrl: g.imageUrl,
    caption: g.caption ?? null,
    captionHindi: g.captionHindi ?? null,
    detailsEn: g.detailsEn ?? null,
    detailsHi: g.detailsHi ?? null,
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
