import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type MemberMessageDoc = {
  id: number;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: Date | string;
  deletedAt?: Date | string | null;
};

function toResponse(message: MemberMessageDoc) {
  return {
    id: message.id,
    title: message.title,
    message: message.message,
    createdAt: new Date(message.createdAt).toISOString(),
  };
}

export async function GET() {
  try {
    const db = await getDb();
    const latest = await db.collection<MemberMessageDoc>("memberMessages").findOne({}, { sort: { createdAt: -1 } });
    return NextResponse.json({ message: latest?.isActive ? toResponse(latest) : null });
  } catch (err) {
    console.error("Failed to load member message:", err);
    return NextResponse.json({ error: "Failed to load member message" }, { status: 500 });
  }
}
