import { NextRequest, NextResponse } from "next/server";
import { getDb, nextSequence } from "@/lib/db";
import { sendDonationReceiptEmail } from "@/lib/email";
import { issueReferralAchievementIfEligible } from "@/lib/referral-achievement-service";
import { getSession } from "@/lib/session";

function generateReceiptNumber() {
  return `RCP-NSF-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 9000) + 1000}`;
}

const MIN_DONATION_AMOUNT = 100;

type DonationDoc = {
  id: number;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string | null;
  donorPan: string | null;
  donorAddress: string | null;
  campaignId: number | null;
  purpose: string;
  receiptNumber: string;
  status: "created" | "paid";
  referral?: ReferralInfo | null;
  payment: {
    mode: "manual" | "razorpay";
    status: "created" | "paid";
    amount: number;
    currency: "INR";
    orderId?: string;
    receipt?: string;
    createdAt: Date;
  };
  createdAt: Date;
};

type ReferralInfo = {
  code: string;
  memberId: number;
  membershipId: string;
  memberName: string;
  referredAt: Date;
};

function normalizeReferralCode(value: unknown) {
  const code = String(value ?? "").trim().toUpperCase();
  return code.length > 0 ? code : null;
}

async function getReferralInfo(db: Awaited<ReturnType<typeof getDb>>, code: string | null): Promise<ReferralInfo | null> {
  if (!code) return null;

  const referringMember = await db.collection<{ id: number; membershipId: string; name: string }>("members").findOne({
    $or: [{ membershipId: code }, { id: Number(code) || -1 }],
  });

  if (!referringMember) return null;

  return {
    code,
    memberId: referringMember.id,
    membershipId: referringMember.membershipId,
    memberName: referringMember.name,
    referredAt: new Date(),
  };
}

function getDonationPaymentMode(): "manual" | "razorpay" {
  return process.env.DONATION_PAYMENT_MODE === "manual" ? "manual" : "razorpay";
}

async function createRazorpayOrder(donation: { id: number; amount: number; receiptNumber: string; campaignId: number | null; purpose: string }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required for donation payments");
  }

  const receipt = `DON-${donation.id}-${Date.now()}`;
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(donation.amount * 100),
      currency: "INR",
      receipt,
      notes: {
        donationId: String(donation.id),
        receiptNumber: donation.receiptNumber,
        campaignId: donation.campaignId ? String(donation.campaignId) : "",
        purpose: donation.purpose,
      },
    }),
  });

  const payload = (await response.json()) as { id?: string; error?: { description?: string } };

  if (!response.ok || !payload.id) {
    throw new Error(payload.error?.description || "Failed to create Razorpay order");
  }

  return {
    keyId,
    orderId: payload.id,
    receipt,
  };
}

function toResponse(donation: DonationDoc, payment?: { provider: "razorpay"; keyId: string; orderId: string; amount: number; currency: "INR" }) {
  return {
    id: donation.id,
    amount: donation.amount,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    donorPhone: donation.donorPhone,
    donorPan: donation.donorPan,
    donorAddress: donation.donorAddress,
    campaignId: donation.campaignId,
    purpose: donation.purpose,
    receiptNumber: donation.receiptNumber,
    status: donation.status,
    paymentStatus: donation.payment.status,
    referral: donation.referral ?? null,
    payment,
    createdAt: donation.createdAt.toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, donorName, donorEmail, donorPhone, donorPan, donorAddress, campaignId, purpose, referralCode } = body;
  const donationAmount = Number(amount);

  if (!donationAmount || donationAmount < MIN_DONATION_AMOUNT || !purpose) {
    return NextResponse.json({ error: `Minimum donation amount is Rs ${MIN_DONATION_AMOUNT}` }, { status: 400 });
  }

  try {
    const db = await getDb();
    const session = await getSession();
    const signedInMember = session.memberId
      ? await db.collection<{ id: number; name: string; email: string; phone?: string | null }>("members").findOne({ id: session.memberId })
      : null;
    const finalDonorName = signedInMember?.name || String(donorName ?? "").trim();
    const finalDonorEmail = signedInMember?.email || String(donorEmail ?? "").trim();
    const finalDonorPhone = signedInMember?.phone || String(donorPhone ?? "").trim();
    const finalDonorPan = String(donorPan ?? "").trim().toUpperCase();
    const finalDonorAddress = String(donorAddress ?? "").trim();

    if (!finalDonorName || !finalDonorEmail) {
      return NextResponse.json({ error: "donor name and email are required" }, { status: 400 });
    }

    const paymentMode = getDonationPaymentMode();
    const donationId = await nextSequence("donations");
    const receiptNumber = generateReceiptNumber();
    const normalizedCampaignId = campaignId ? Number(campaignId) : null;
    const referral = await getReferralInfo(db, normalizeReferralCode(referralCode));
    const razorpayOrder =
      paymentMode === "razorpay"
        ? await createRazorpayOrder({
            id: donationId,
            amount: donationAmount,
            receiptNumber,
            campaignId: normalizedCampaignId,
            purpose,
          })
        : null;

    const donation: DonationDoc = {
      id: donationId,
      amount: donationAmount,
      donorName: finalDonorName,
      donorEmail: finalDonorEmail,
      donorPhone: finalDonorPhone || null,
      donorPan: finalDonorPan || null,
      donorAddress: finalDonorAddress || null,
      campaignId: normalizedCampaignId,
      purpose,
      receiptNumber,
      status: paymentMode === "razorpay" ? "created" : "paid",
      referral,
      payment: {
        mode: paymentMode,
        status: paymentMode === "razorpay" ? "created" : "paid",
        amount: donationAmount,
        currency: "INR",
        orderId: razorpayOrder?.orderId,
        receipt: razorpayOrder?.receipt,
        createdAt: new Date(),
      },
      createdAt: new Date(),
    };

    await db.collection<DonationDoc>("donations").insertOne(donation);

    if (paymentMode === "manual" && normalizedCampaignId) {
      await db.collection("campaigns").updateOne(
        { id: normalizedCampaignId },
        { $inc: { raisedAmount: donationAmount, donorCount: 1 } },
      );
    }

    if (paymentMode === "manual" && referral) {
      await issueReferralAchievementIfEligible(db, referral.memberId, req.url);
    }

    let emailSent = false;
    if (paymentMode === "manual") {
      try {
        await sendDonationReceiptEmail(donation, req.url);
        emailSent = true;
      } catch (emailError) {
        console.error("Donation receipt email failed:", emailError);
      }
    }

    return NextResponse.json(
      {
        ...toResponse(
        donation,
        razorpayOrder
          ? {
              provider: "razorpay",
              keyId: razorpayOrder.keyId,
              orderId: razorpayOrder.orderId,
              amount: donation.amount,
              currency: "INR",
            }
          : undefined,
        ),
        emailSent,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create donation" }, { status: 500 });
  }
}
