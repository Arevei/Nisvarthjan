import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendBirthdayWishEmail } from "@/lib/email";
import { getSession } from "@/lib/session";
import type { Collection } from "mongodb";

type MemberBirthdayDoc = {
  id: number;
  name?: string;
  email?: string;
  dateOfBirth?: string | null;
  birthdayWishYears?: number[];
};

const INDIA_TIME_ZONE = "Asia/Kolkata";

function getIndiaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };
}

function getBirthDateParts(dateOfBirth: string | null | undefined) {
  if (!dateOfBirth) return false;

  const isoDate = dateOfBirth.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) {
    return { month: Number(isoDate[2]), day: Number(isoDate[3]) };
  }

  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return false;

  return { month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function isBirthdayToday(dateOfBirth: string | null | undefined, today = new Date()) {
  const birthDate = getBirthDateParts(dateOfBirth);
  if (!birthDate) return false;

  const indiaToday = getIndiaDateParts(today);
  return birthDate.day === indiaToday.day && birthDate.month === indiaToday.month;
}

async function sendBirthdayWishForMember(member: MemberBirthdayDoc, members: Collection<MemberBirthdayDoc> | null = null) {
  const indiaToday = getIndiaDateParts();
  const currentYear = indiaToday.year;
  const isBirthday = isBirthdayToday(member.dateOfBirth);
  const alreadySent = member.birthdayWishYears?.includes(currentYear) ?? false;

  if (!isBirthday) return { isBirthday: false, emailSent: false };
  if (alreadySent) return { isBirthday: true, emailSent: false, alreadySent: true };

  await sendBirthdayWishEmail(member);
  if (members) {
    await members.updateOne({ id: member.id }, { $addToSet: { birthdayWishYears: currentYear } });
  }

  return { isBirthday: true, emailSent: true };
}

function cronIsAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!cronIsAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const members = db.collection<MemberBirthdayDoc>("members");
  const indiaToday = getIndiaDateParts();
  const allMembers = await members
    .find({
      email: { $exists: true, $ne: "" },
      birthdayWishYears: { $ne: indiaToday.year },
    })
    .toArray();

  let birthdayCount = 0;
  let sentCount = 0;
  const failed: Array<{ id: number; email?: string }> = [];

  for (const member of allMembers) {
    if (!isBirthdayToday(member.dateOfBirth)) continue;
    birthdayCount += 1;

    try {
      const result = await sendBirthdayWishForMember(member, members);
      if (result.emailSent) sentCount += 1;
    } catch (error) {
      failed.push({ id: member.id, email: member.email });
      console.error("Birthday wish email failed:", error);
    }
  }

  return NextResponse.json({
    date: `${indiaToday.year}-${String(indiaToday.month).padStart(2, "0")}-${String(indiaToday.day).padStart(2, "0")}`,
    birthdayCount,
    sentCount,
    failedCount: failed.length,
    failed,
  });
}

export async function POST() {
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = await getDb();
  const members = db.collection<MemberBirthdayDoc>("members");
  const member = await members.findOne({ id: session.memberId });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  try {
    return NextResponse.json(await sendBirthdayWishForMember(member, members));
  } catch (error) {
    console.error("Birthday wish email failed:", error);
    return NextResponse.json({ isBirthday: true, emailSent: false });
  }
}
