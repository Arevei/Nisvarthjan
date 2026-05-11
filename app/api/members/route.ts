import { NextRequest, NextResponse } from "next/server";
import { getDb, nextSequence } from "@/lib/db";

function generateMembershipId() {
  return `NSF-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
}
function generateCertificateNumber() {
  return `CERT-NSF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`;
}

function fmt(m: any) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    address: m.address ?? null,
    city: m.city ?? null,
    state: m.state ?? null,
    membershipType: m.membershipType,
    membershipId: m.membershipId,
    status: m.status,
    certificateNumber: m.certificateNumber ?? null,
    joinedAt: new Date(m.joinedAt).toISOString(),
  };
}

export async function GET() {
  try {
    const db = await getDb();
    const members = await db.collection("members").find({}).sort({ joinedAt: 1 }).toArray();
    return NextResponse.json(members.map(fmt));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, address, city, state, membershipType, password } = body;
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
    const member = {
      id,
      name,
      email: normalizedEmail,
      phone,
      address: address ?? null,
      city: city ?? null,
      state: state ?? null,
      membershipType: membershipType ?? "general",
      membershipId: generateMembershipId(),
      status: "active",
      certificateNumber: generateCertificateNumber(),
      password: String(password),
      joinedAt: new Date(),
    };

    await db.collection("members").insertOne(member);
    return NextResponse.json(fmt(member), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to register member" }, { status: 500 });
  }
}
