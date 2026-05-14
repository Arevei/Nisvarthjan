import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

type NewsDoc = {
  id: number;
  title: string;
  titleHindi?: string | null;
  content: string;
  contentHindi?: string | null;
  excerpt?: string | null;
  imageUrl?: string | null;
  category: string;
  author?: string | null;
  publishedAt: Date | string;
};

function fmt(a: NewsDoc) {
  return {
    id: a.id,
    title: a.title,
    titleHindi: a.titleHindi ?? null,
    content: a.content,
    contentHindi: a.contentHindi ?? null,
    excerpt: a.excerpt ?? null,
    imageUrl: a.imageUrl ?? null,
    category: a.category,
    author: a.author ?? null,
    publishedAt: new Date(a.publishedAt).toISOString(),
  };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const db = await getDb();
    const article = await db.collection<NewsDoc>("news").findOne({ id });
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json(fmt(article));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get news article" }, { status: 500 });
  }
}
