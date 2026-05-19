import { NextRequest, NextResponse } from "next/server";
import { getDb, nextSequence } from "@/lib/db";
import { sendEnquiryAutoResponseEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ error: "name, email, message are required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const doc = {
      id: await nextSequence("contacts"),
      name,
      email: String(email).trim().toLowerCase(),
      phone: phone ?? null,
      message,
      status: "new",
      autoResponseSent: false,
      replies: [],
      createdAt: new Date(),
    };
    await db.collection("contacts").insertOne(doc);

    let autoResponseSent = false;
    try {
      await sendEnquiryAutoResponseEmail(doc);
      autoResponseSent = true;
      await db.collection("contacts").updateOne(
        { id: doc.id },
        { $set: { autoResponseSent: true, autoResponseSentAt: new Date() } },
      );
    } catch (emailError) {
      console.error("Enquiry auto response failed:", emailError);
    }

    return NextResponse.json(
      {
        id: doc.id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        message: doc.message,
        status: doc.status,
        autoResponseSent,
        createdAt: doc.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
  }
}
