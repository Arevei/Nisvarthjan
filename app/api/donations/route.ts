import { NextRequest, NextResponse } from "next/server";
import { getDb, nextSequence } from "@/lib/db";

function generateReceiptNumber() {
  return `RCP-NSF-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 9000) + 1000}`;
}

type DonationDoc = {
  id: number;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string | null;
  campaignId: number | null;
  purpose: string;
  receiptNumber: string;
  status: "created" | "paid";
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
    campaignId: donation.campaignId,
    purpose: donation.purpose,
    receiptNumber: donation.receiptNumber,
    status: donation.status,
    paymentStatus: donation.payment.status,
    payment,
    createdAt: donation.createdAt.toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, donorName, donorEmail, donorPhone, campaignId, purpose } = body;
  const donationAmount = Number(amount);

  if (!donationAmount || donationAmount <= 0 || !donorName || !donorEmail || !purpose) {
    return NextResponse.json({ error: "amount, donorName, donorEmail, purpose are required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const paymentMode = getDonationPaymentMode();
    const donationId = await nextSequence("donations");
    const receiptNumber = generateReceiptNumber();
    const normalizedCampaignId = campaignId ? Number(campaignId) : null;
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
      donorName,
      donorEmail,
      donorPhone: donorPhone || null,
      campaignId: normalizedCampaignId,
      purpose,
      receiptNumber,
      status: paymentMode === "razorpay" ? "created" : "paid",
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

    return NextResponse.json(
      toResponse(
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
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create donation" }, { status: 500 });
  }
}
