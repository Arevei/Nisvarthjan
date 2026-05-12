import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

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

export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const db = await getDb();
    const article = await db.collection("news").findOne({ id });
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json(fmt(article));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get news article" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  try {
    const db = await getDb();
    const updateData = {
      title: body.title,
      titleHindi: body.titleHindi ?? null,
      content: body.content,
      contentHindi: body.contentHindi ?? null,
      excerpt: body.excerpt ?? null,
      imageUrl: body.imageUrl ?? null,
      category: body.category,
      author: body.author ?? null,
    };

    const result = await db.collection("news").findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!result) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json(fmt(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update news article" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const db = await getDb();
    await db.collection("news").deleteOne({ id });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete news article" }, { status: 500 });
  }
}
