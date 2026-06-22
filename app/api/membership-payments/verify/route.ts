import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendMembershipPaymentDocumentsEmail } from "@/lib/email";

type PaymentVerifyBody = {
  memberId?: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

type MemberPaymentDoc = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  membershipType: string;
  membershipId: string;
  status: string;
  certificateNumber?: string | null;
  joinedAt: Date | string;
  payment?: {
    mode?: string;
    status?: string;
    orderId?: string;
    paymentId?: string;
    receipt?: string;
    amount?: number;
    currency?: string;
    paidAt?: Date;
  };
};

function verifySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured");
  }

  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function toResponse(member: MemberPaymentDoc) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    address: member.address ?? null,
    city: member.city ?? null,
    state: member.state ?? null,
    membershipType: member.membershipType,
    membershipId: member.membershipId,
    status: member.status,
    certificateNumber: member.certificateNumber ?? null,
    joinedAt: new Date(member.joinedAt).toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PaymentVerifyBody;
  const memberId = Number(body.memberId);
  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");

  if (!memberId || !orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Payment verification details are required" }, { status: 400 });
  }

  try {
    if (!verifySignature(orderId, paymentId, signature)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const db = await getDb();
    const members = db.collection<MemberPaymentDoc>("members");
    const existing = await members.findOne({ id: memberId, "payment.orderId": orderId });

    if (!existing) {
      return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
    }

    const updated = await members.findOneAndUpdate(
      { id: memberId },
      {
        $set: {
          status: "approval_pending",
          "payment.status": "paid",
          "payment.paymentId": paymentId,
          "payment.signature": signature,
          "payment.paidAt": new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
    }

    const session = await getSession();
    session.memberId = updated.id;
    await session.save();

    let emailSent = true;
    try {
      await sendMembershipPaymentDocumentsEmail(updated, req.url);
    } catch (emailError) {
      emailSent = false;
      console.error("Membership receipt email failed:", emailError);
    }

    return NextResponse.json({ member: toResponse(updated), emailSent });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
