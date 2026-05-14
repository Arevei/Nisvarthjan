import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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

export async function GET() {
  try {
    const db = await getDb();
    const articles = await db.collection<NewsDoc>("news").find({}).sort({ publishedAt: -1 }).toArray();
    return NextResponse.json(articles.map(fmt));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list news" }, { status: 500 });
  }
}
