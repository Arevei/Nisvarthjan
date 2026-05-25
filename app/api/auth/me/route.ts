import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

type EnquiryReplyDoc = {
  message: string;
  sentBy: string;
  sentAt: Date;
};

type EnquiryDoc = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
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

export async function GET() {
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const member = await db.collection("members").findOne({ id: session.memberId });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 401 });

    const donationRows = await db
      .collection("donations")
      .aggregate<{ totalAmount: number; count: number }>([
        {
          $match: {
            donorEmail: { $regex: `^${escapeRegex(member.email)}$`, $options: "i" },
            $or: [{ status: "paid" }, { "payment.status": "paid" }, { payment: { $exists: false } }],
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    const donationStats = donationRows[0] ?? { totalAmount: 0, count: 0 };
    const activeEnquiries = await db
      .collection<EnquiryDoc>("contacts")
      .find({
        email: { $regex: `^${escapeRegex(member.email)}$`, $options: "i" },
        status: { $ne: "closed" },
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth ?? null,
      address: member.address,
      city: member.city,
      state: member.state,
      membershipType: member.membershipType,
      membershipId: member.membershipId,
      status: member.status,
      certificateNumber: member.certificateNumber,
      referral: member.referral ?? null,
      referralAchievement: member.referralAchievement ?? null,
      donationStats: {
        totalAmount: Number(donationStats.totalAmount ?? 0),
        count: Number(donationStats.count ?? 0),
      },
      activeEnquiries: activeEnquiries.map(serializeEnquiry),
      joinedAt: new Date(member.joinedAt).toISOString(),
    });
  } catch (err) {
    console.error("Failed to get current user:", err);
    return NextResponse.json({ error: "Failed to get current user" }, { status: 500 });
  }
}
