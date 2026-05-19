import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendDonationReceiptEmail } from "@/lib/email";
import { issueReferralAchievementIfEligible } from "@/lib/referral-achievement-service";

type PaymentVerifyBody = {
  donationId?: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

type DonationPaymentDoc = {
  id: number;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string | null;
  campaignId?: number | null;
  purpose: string;
  receiptNumber: string;
  status?: string;
  referral?: {
    code: string;
    memberId: number;
    membershipId: string;
    memberName: string;
    referredAt: Date | string;
  } | null;
  createdAt: Date | string;
  payment?: {
    mode?: string;
    status?: string;
    orderId?: string;
    paymentId?: string;
    signature?: string;
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

function toResponse(donation: DonationPaymentDoc) {
  return {
    id: donation.id,
    amount: donation.amount,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    donorPhone: donation.donorPhone ?? null,
    campaignId: donation.campaignId ?? null,
    purpose: donation.purpose,
    receiptNumber: donation.receiptNumber,
    status: donation.status ?? "paid",
    paymentStatus: donation.payment?.status ?? "paid",
    paymentId: donation.payment?.paymentId ?? null,
    referral: donation.referral ?? null,
    createdAt: new Date(donation.createdAt).toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PaymentVerifyBody;
  const donationId = Number(body.donationId);
  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");

  if (!donationId || !orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Payment verification details are required" }, { status: 400 });
  }

  try {
    if (!verifySignature(orderId, paymentId, signature)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const db = await getDb();
    const donations = db.collection<DonationPaymentDoc>("donations");
    const paidAt = new Date();
    const updated = await donations.findOneAndUpdate(
      { id: donationId, "payment.orderId": orderId, "payment.status": { $ne: "paid" } },
      {
        $set: {
          status: "paid",
          "payment.status": "paid",
          "payment.paymentId": paymentId,
          "payment.signature": signature,
          "payment.paidAt": paidAt,
        },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      const existing = await donations.findOne({ id: donationId, "payment.orderId": orderId });
      if (existing?.payment?.status === "paid") {
        return NextResponse.json({ donation: toResponse(existing) });
      }
      return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
    }

    if (updated.campaignId) {
      await db.collection("campaigns").updateOne(
        { id: updated.campaignId },
        { $inc: { raisedAmount: updated.amount, donorCount: 1 } },
      );
    }

    if (updated.referral) {
      await issueReferralAchievementIfEligible(db, updated.referral.memberId, req.url);
    }

    let emailSent = true;
    try {
      await sendDonationReceiptEmail(updated, req.url);
    } catch (emailError) {
      emailSent = false;
      console.error("Donation receipt email failed:", emailError);
    }

    return NextResponse.json({ donation: toResponse(updated), emailSent });
  } catch (error) {
    console.error("Donation payment verification failed:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
