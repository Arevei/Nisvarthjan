import { NextRequest, NextResponse } from "next/server";
import { sendSms, generateDonationReceiptSms } from "@/lib/twilio-sms";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { donationId } = await req.json();

  if (!donationId) {
    return NextResponse.json({ error: "Missing donation ID" }, { status: 400 });
  }

  const db = await getDb();
  const donation = await db.collection("donations").findOne({ id: Number(donationId) });

  if (!donation) {
    return NextResponse.json({ error: "Donation not found" }, { status: 404 });
  }

  if (!donation.donorPhone) {
    return NextResponse.json({ error: "Donor phone number not available" }, { status: 400 });
  }

  const message = generateDonationReceiptSms(donation.donorName, donation.amount, donation.receiptNumber);

  const result = await sendSms({ to: donation.donorPhone, message });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, sid: result.sid });
}
