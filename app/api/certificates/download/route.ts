import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

interface MemberRecord {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  membershipType?: string;
  membershipId?: string;
  status?: string;
  certificateNumber?: string | null;
  joinedAt?: string | Date;
}

function formatDate(value: string | Date | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatMembershipType(value: string | undefined) {
  if (!value) return "Member";

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function safeText(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not available";
  return String(value);
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "membership-certificate";
}

function addCenteredText(doc: jsPDF, text: string, y: number, size: number, color: [number, number, number]) {
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(text, 148.5, y, { align: "center" });
}

function addCenteredFitText(
  doc: jsPDF,
  text: string,
  y: number,
  size: number,
  minSize: number,
  maxWidth: number,
  color: [number, number, number],
) {
  let fontSize = size;
  doc.setFontSize(fontSize);

  while (fontSize > minSize && doc.getTextWidth(text) > maxWidth) {
    fontSize -= 1;
    doc.setFontSize(fontSize);
  }

  doc.setTextColor(...color);
  doc.text(text, 148.5, y, { align: "center", maxWidth });
}

function addValueText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number) {
  const lines = doc.splitTextToSize(text, maxWidth).slice(0, 2);
  doc.text(lines, x, y);
}

function generateCertificatePdf(member: MemberRecord) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const certificateNumber = safeText(member.certificateNumber);
  const issuedAt = formatDate(member.joinedAt);
  const membershipType = formatMembershipType(member.membershipType);
  const location = [member.city, member.state].filter(Boolean).join(", ") || "Not available";
  const address = safeText(member.address);

  doc.setFillColor(255, 252, 248);
  doc.rect(0, 0, 297, 210, "F");

  doc.setDrawColor(190, 0, 39);
  doc.setLineWidth(1.2);
  doc.rect(12, 12, 273, 186);
  doc.setLineWidth(0.35);
  doc.rect(18, 18, 261, 174);

  doc.setFillColor(190, 0, 39);
  doc.circle(148.5, 35, 13, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NSF", 148.5, 40, { align: "center" });

  doc.setFont("helvetica", "bold");
  addCenteredText(doc, "NISVARTHJAN SEVA FOUNDATION", 60, 22, [28, 28, 28]);

  doc.setFont("helvetica", "normal");
  addCenteredText(doc, "Membership Certificate", 74, 18, [190, 0, 39]);

  doc.setDrawColor(190, 0, 39);
  doc.line(92, 82, 205, 82);

  doc.setFont("helvetica", "normal");
  addCenteredText(doc, "This certificate is proudly issued to", 99, 13, [89, 78, 73]);

  doc.setFont("helvetica", "bold");
  addCenteredFitText(doc, safeText(member.name), 116, 28, 16, 210, [25, 25, 25]);

  doc.setFont("helvetica", "normal");
  addCenteredText(
    doc,
    `as a ${membershipType} member of Nisvarthjan Seva Foundation.`,
    132,
    13,
    [89, 78, 73],
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(190, 0, 39);
  doc.text("Certificate No.", 34, 154);
  doc.text("Membership ID", 34, 166);
  doc.text("Issued On", 34, 178);

  doc.setTextColor(35, 35, 35);
  doc.text(certificateNumber, 78, 154);
  addValueText(doc, safeText(member.membershipId), 78, 166, 72);
  doc.text(issuedAt, 78, 178);

  doc.setTextColor(190, 0, 39);
  doc.text("Email", 178, 154);
  doc.text("Phone", 178, 166);
  doc.text("Location", 178, 178);

  doc.setTextColor(35, 35, 35);
  addValueText(doc, safeText(member.email), 207, 154, 58);
  addValueText(doc, safeText(member.phone), 207, 166, 58);
  addValueText(doc, location, 207, 178, 58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(105, 105, 105);
  doc.text(doc.splitTextToSize(`Address: ${address}`, 230), 34, 188);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(190, 0, 39);
  doc.text("Verify this certificate using the certificate number on the official website.", 148.5, 193, {
    align: "center",
  });

  return doc.output("arraybuffer");
}

export async function GET() {
  const session = await getSession();

  if (!session.memberId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const member = await db.collection<MemberRecord>("members").findOne({ id: session.memberId });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.status !== "active") {
      return NextResponse.json({ error: "Membership is not active" }, { status: 403 });
    }

    if (!member.certificateNumber) {
      return NextResponse.json({ error: "Certificate has not been issued yet" }, { status: 404 });
    }

    const pdf = generateCertificatePdf(member);
    const fileName = `${safeFileName(member.certificateNumber)}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Failed to download certificate:", err);
    return NextResponse.json({ error: "Failed to download certificate" }, { status: 500 });
  }
}
