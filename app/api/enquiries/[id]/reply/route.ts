import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

type EnquiryReplyDoc = {
  message: string;
  sentBy: string;
  sentAt: Date;
};

type EnquiryDoc = {
  id: number;
  email: string;
  message: string;
  status?: "new" | "in_review" | "replied" | "closed";
  replies?: EnquiryReplyDoc[];
  createdAt: Date;
  updatedAt?: Date;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeEnquiry(enquiry: EnquiryDoc) {
  return {
    id: enquiry.id,
    message: enquiry.message,
    status: enquiry.status ?? "new",
    replies: (enquiry.replies ?? []).map((reply) => ({
      message: reply.message,
      sentBy: reply.sentBy,
      sentAt: new Date(reply.sentAt).toISOString(),
    })),
    createdAt: new Date(enquiry.createdAt).toISOString(),
    updatedAt: enquiry.updatedAt ? new Date(enquiry.updatedAt).toISOString() : null,
  };
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const id = Number.parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid enquiry ID" }, { status: 400 });
  }

  const body = (await req.json()) as { message?: string };
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Reply message is required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const member = await db.collection("members").findOne({ id: session.memberId });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 401 });

    const enquiries = db.collection<EnquiryDoc>("contacts");
    const existing = await enquiries.findOne({
      id,
      email: { $regex: `^${escapeRegex(member.email)}$`, $options: "i" },
      status: { $ne: "closed" },
    });
    if (!existing) {
      return NextResponse.json({ error: "Active enquiry not found" }, { status: 404 });
    }

    const now = new Date();
    const updated = await enquiries.findOneAndUpdate(
      { id: existing.id },
      {
        $set: {
          status: "in_review",
          updatedAt: now,
        },
        $push: {
          replies: {
            message,
            sentBy: member.email,
            sentAt: now,
          },
        },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
    }

    return NextResponse.json({ enquiry: serializeEnquiry(updated) });
  } catch (err) {
    console.error("Failed to reply to enquiry:", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
