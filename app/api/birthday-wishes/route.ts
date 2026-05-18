import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendBirthdayWishEmail } from "@/lib/email";
import { getSession } from "@/lib/session";

type MemberBirthdayDoc = {
  id: number;
  name?: string;
  email?: string;
  dateOfBirth?: string | null;
  birthdayWishYears?: number[];
};

function isBirthdayToday(dateOfBirth: string | null | undefined, today = new Date()) {
  if (!dateOfBirth) return false;

  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return false;

  return date.getUTCDate() === today.getDate() && date.getUTCMonth() === today.getMonth();
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

  const today = new Date();
  const currentYear = today.getFullYear();
  const isBirthday = isBirthdayToday(member.dateOfBirth, today);
  const alreadySent = member.birthdayWishYears?.includes(currentYear) ?? false;

  if (!isBirthday) {
    return NextResponse.json({ isBirthday: false, emailSent: false });
  }

  if (alreadySent) {
    return NextResponse.json({ isBirthday: true, emailSent: false, alreadySent: true });
  }

  try {
    await sendBirthdayWishEmail(member);
    await members.updateOne({ id: member.id }, { $addToSet: { birthdayWishYears: currentYear } });

    return NextResponse.json({ isBirthday: true, emailSent: true });
  } catch (error) {
    console.error("Birthday wish email failed:", error);
    return NextResponse.json({ isBirthday: true, emailSent: false });
  }
}
