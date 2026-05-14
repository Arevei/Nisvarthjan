import { NextRequest, NextResponse } from "next/server";
import { getDb, nextSequence } from "@/lib/db";

function generateReceiptNumber() {
  return `RCP-NSF-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 9000) + 1000}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, donorName, donorEmail, donorPhone, campaignId, purpose } = body;
  if (!amount || !donorName || !donorEmail || !purpose) {
    return NextResponse.json({ error: "amount, donorName, donorEmail, purpose are required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const donation = {
      id: await nextSequence("donations"),
      amount: Number(amount),
      donorName,
      donorEmail,
      donorPhone: donorPhone ?? null,
      campaignId: campaignId ?? null,
      purpose,
      receiptNumber: generateReceiptNumber(),
      createdAt: new Date(),
    };

    await db.collection("donations").insertOne(donation);

    if (campaignId) {
      await db.collection("campaigns").updateOne(
        { id: campaignId },
        { $inc: { raisedAmount: Number(amount), donorCount: 1 } },
      );
    }

    return NextResponse.json(
      {
        id: donation.id,
        amount: donation.amount,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        campaignId: donation.campaignId,
        purpose: donation.purpose,
        receiptNumber: donation.receiptNumber,
        createdAt: donation.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 });
  }
}
