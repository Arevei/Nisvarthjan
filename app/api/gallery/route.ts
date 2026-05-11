import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const images = await db.collection("gallery").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(
      images.map((g: any) => ({
        id: g.id,
        imageUrl: g.imageUrl,
        caption: g.caption ?? null,
        captionHindi: g.captionHindi ?? null,
        category: g.category,
        createdAt: new Date(g.createdAt).toISOString(),
      })),
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list gallery images" }, { status: 500 });
  }
}
