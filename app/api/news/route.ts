import { NextRequest, NextResponse } from "next/server";
import { getDb, nextSequence } from "@/lib/db";

function fmt(a: any) {
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
    const articles = await db.collection("news").find({}).sort({ publishedAt: -1 }).toArray();
    return NextResponse.json(articles.map(fmt));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list news" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, titleHindi, content, contentHindi, excerpt, imageUrl, category, author } = body;
  if (!title || !content || !category) {
    return NextResponse.json({ error: "title, content, category are required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const article = {
      id: await nextSequence("news"),
      title,
      titleHindi: titleHindi ?? null,
      content,
      contentHindi: contentHindi ?? null,
      excerpt: excerpt ?? null,
      imageUrl: imageUrl ?? null,
      category,
      author: author ?? null,
      publishedAt: new Date(),
    };

    await db.collection("news").insertOne(article);
    return NextResponse.json(fmt(article), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create news article" }, { status: 500 });
  }
}
