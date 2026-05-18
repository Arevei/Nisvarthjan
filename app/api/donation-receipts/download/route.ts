import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateDonationReceiptPdf, safeFileName, type DonationReceiptRecord } from "@/lib/donation-receipts";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const receiptNumber = searchParams.get("receiptNumber")?.trim();
  const contact = searchParams.get("contact")?.trim();

  if (!receiptNumber) {
    return NextResponse.json({ error: "receiptNumber is required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const donation = await db.collection<DonationReceiptRecord>("donations").findOne({ receiptNumber });

    if (!donation) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (donation.status !== "paid" && donation.payment?.status !== "paid") {
      return NextResponse.json({ error: "Receipt is not available until payment is confirmed" }, { status: 403 });
    }

    if (contact && donation.donorEmail !== contact && donation.donorPhone !== contact) {
      return NextResponse.json({ error: "Receipt details do not match" }, { status: 403 });
    }

    const pdf = await generateDonationReceiptPdf(donation, req.url);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName(donation.receiptNumber)}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Failed to download donation receipt:", err);
    return NextResponse.json({ error: "Failed to download donation receipt" }, { status: 500 });
  }
}
