import { NextRequest, NextResponse } from "next/server";
import { getDb, nextSequence } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getMembershipFee, getPaymentMode } from "@/lib/membership-payments";
import { hashPassword } from "@/lib/auth";

function generateMembershipId() {
  return `NSF-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
}

type MemberDoc = {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  membershipType: string;
  membershipId: string;
  status: string;
  certificateNumber?: string | null;
  referral?: ReferralInfo | null;
  referralAchievement?: unknown;
  password?: string;
  photo?: string | null;
  education?: string | null;
  donationPurpose?: string | null;
  payment?: {
    mode: "manual" | "razorpay";
    status: "manual_review" | "created" | "paid";
    amount: number;
    currency: "INR";
    orderId?: string;
    receipt?: string;
    createdAt?: Date;
  };
  joinedAt: Date | string;
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

  const referringMember = await db.collection<MemberDoc>("members").findOne({
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

async function createRazorpayOrder(member: { id: number; membershipId: string; membershipType: string }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required for PAYMENT_MODE=razorpay");
  }

  const amount = getMembershipFee(member.membershipType);
  const receipt = `MBR-${member.id}-${Date.now()}`;
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      receipt,
      notes: {
        memberId: String(member.id),
        membershipId: member.membershipId,
        membershipType: member.membershipType,
      },
    }),
  });

  const payload = (await response.json()) as { id?: string; error?: { description?: string } };

  if (!response.ok || !payload.id) {
    throw new Error(payload.error?.description || "Failed to create Razorpay order");
  }

  return {
    amount,
    receipt,
    orderId: payload.id,
    keyId,
  };
}

function fmt(m: MemberDoc) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    dateOfBirth: m.dateOfBirth ?? null,
    address: m.address ?? null,
    city: m.city ?? null,
    state: m.state ?? null,
    membershipType: m.membershipType,
    membershipId: m.membershipId,
    status: m.status,
    certificateNumber: m.certificateNumber ?? null,
    referral: m.referral ?? null,
    referralAchievement: m.referralAchievement ?? null,
    photo: m.photo ?? null,
    education: m.education ?? null,
    donationPurpose: m.donationPurpose ?? null,
    joinedAt: new Date(m.joinedAt).toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, dateOfBirth, address, city, state, membershipType, password, referralCode, photo, education, donationPurpose } = body;
  if (!name || !email || !phone || !password) {
    return NextResponse.json({ error: "name, email, phone, password are required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await db.collection("members").findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const id = await nextSequence("members");
    const selectedMembershipType = membershipType ?? "general";
    const paymentMode = getPaymentMode();
    const amount = getMembershipFee(selectedMembershipType);
    const membershipId = generateMembershipId();
    const referral = await getReferralInfo(db, normalizeReferralCode(referralCode));
    const razorpayOrder =
      paymentMode === "razorpay"
        ? await createRazorpayOrder({ id, membershipId, membershipType: selectedMembershipType })
        : null;
    const member: MemberDoc = {
      id,
      name,
      email: normalizedEmail,
      phone,
      dateOfBirth: dateOfBirth || null,
      address: address ?? null,
      city: city ?? null,
      state: state ?? null,
      membershipType: selectedMembershipType,
      membershipId,
      status: paymentMode === "razorpay" ? "payment_pending" : "pending",
      certificateNumber: null,
      payment: {
        mode: paymentMode,
        status: paymentMode === "razorpay" ? "created" : "manual_review",
        amount,
        currency: "INR",
        orderId: razorpayOrder?.orderId,
        receipt: razorpayOrder?.receipt,
        createdAt: new Date(),
      },
      referral,
      password: await hashPassword(String(password)),
      photo: photo || null,
      education: education || null,
      donationPurpose: donationPurpose || null,
      joinedAt: new Date(),
    };

    await db.collection("members").insertOne(member);

    const session = await getSession();
    session.memberId = member.id;
    await session.save();

    if (paymentMode === "razorpay" && razorpayOrder) {
      return NextResponse.json(
        {
          member: fmt(member),
          paymentMode,
          payment: {
            provider: "razorpay",
            keyId: razorpayOrder.keyId,
            orderId: razorpayOrder.orderId,
            amount: razorpayOrder.amount,
            currency: "INR",
          },
        },
        { status: 201 },
      );
    }

    return NextResponse.json({ member: fmt(member), paymentMode }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to register member" }, { status: 500 });
  }
}
