import { readFileSync } from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export interface MemberDocumentRecord {
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
  payment?: {
    mode?: string;
    status?: string;
    orderId?: string;
    paymentId?: string;
    receipt?: string;
    amount?: number;
    currency?: string;
    paidAt?: string | Date;
  };
}

export function formatDate(value: string | Date | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatMembershipType(value: string | undefined) {
  if (!value) return "Member";

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function safeText(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not available";
  return String(value);
}

export function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "membership-document";
}

export function getVerificationBaseUrl(requestUrl: string) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(requestUrl).origin;
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

function getPngDimensions(buffer: Buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getCertificateLogo() {
  const logoPath = path.join(process.cwd(), "public", "brand", "footer-logo.png");
  const logoBuffer = readFileSync(logoPath);

  return {
    dataUrl: `data:image/png;base64,${logoBuffer.toString("base64")}`,
    ...getPngDimensions(logoBuffer),
  };
}

export function getMembershipReceiptNumber(member: MemberDocumentRecord) {
  return member.payment?.receipt || `MRC-${safeText(member.membershipId).replace(/[^a-z0-9]+/gi, "-")}`;
}

export async function generateMembershipCertificatePdf(member: MemberDocumentRecord, requestUrl: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const certificateNumber = safeText(member.certificateNumber);
  const issuedAt = formatDate(member.joinedAt);
  const membershipType = formatMembershipType(member.membershipType);
  const location = [member.city, member.state].filter(Boolean).join(", ") || "Not available";
  const verificationUrl = `${getVerificationBaseUrl(requestUrl)}/verify/${encodeURIComponent(certificateNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 180,
  });

  doc.setFillColor(255, 252, 248);
  doc.rect(0, 0, 297, 210, "F");

  doc.setDrawColor(190, 0, 39);
  doc.setLineWidth(1.2);
  doc.rect(12, 12, 273, 186);
  doc.setLineWidth(0.35);
  doc.rect(18, 18, 261, 174);

  const logo = getCertificateLogo();
  const logoHeight = 22;
  const logoWidth = logoHeight * (logo.width / logo.height);
  doc.addImage(logo.dataUrl, "PNG", (297 - logoWidth) / 2, 22, logoWidth, logoHeight);

  doc.addImage(qrDataUrl, "PNG", 244, 22, 24, 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(190, 0, 39);
  doc.text("SCAN TO VERIFY", 256, 51, { align: "center" });

  doc.setFont("helvetica", "normal");
  addCenteredText(doc, "MEMBERSHIP CERTIFICATE", 58, 18, [190, 0, 39]);

  doc.setDrawColor(190, 0, 39);
  doc.line(92, 66, 205, 66);

  doc.setFont("helvetica", "normal");
  addCenteredText(doc, "This certificate is proudly issued to", 80, 13, [89, 78, 73]);

  doc.setFont("times", "bolditalic");
  addCenteredFitText(doc, safeText(member.name).toUpperCase(), 94, 30, 18, 210, [25, 25, 25]);

  doc.setFont("helvetica", "normal");
  addCenteredText(
    doc,
    `as a ${membershipType} member of Nisvarthjan Seva Foundation.`,
    108,
    13,
    [89, 78, 73],
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(190, 0, 39);
  doc.text("Certificate No.", 34, 124);
  doc.text("Membership ID", 34, 135);
  doc.text("Issued On", 34, 146);

  doc.setTextColor(35, 35, 35);
  doc.text(certificateNumber, 78, 124);
  addValueText(doc, safeText(member.membershipId), 78, 135, 72);
  doc.text(issuedAt, 78, 146);

  doc.setTextColor(190, 0, 39);
  doc.text("Email", 178, 124);
  doc.text("Phone", 178, 135);
  doc.text("Location", 178, 146);

  doc.setTextColor(35, 35, 35);
  addValueText(doc, safeText(member.email), 207, 124, 58);
  addValueText(doc, safeText(member.phone), 207, 135, 58);
  addValueText(doc, location, 207, 146, 58);

  doc.setDrawColor(35, 35, 35);
  doc.setLineWidth(0.3);
  doc.line(205, 174, 262, 174);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(190, 0, 39);
  doc.text("Authorized Signature", 233.5, 180, { align: "center" });

  return doc.output("arraybuffer");
}

export async function generateMembershipReceiptPdf(member: MemberDocumentRecord, requestUrl: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const receiptNumber = getMembershipReceiptNumber(member);
  const certificateNumber = safeText(member.certificateNumber);
  const amount = member.payment?.amount ? `INR ${member.payment.amount.toLocaleString("en-IN")}` : "Not available";
  const paidAt = formatDate(member.payment?.paidAt || member.joinedAt);
  const verifyUrl = `${getVerificationBaseUrl(requestUrl)}/verify?certificateNumber=${encodeURIComponent(certificateNumber)}&documentType=membership-receipt`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { errorCorrectionLevel: "M", margin: 1, width: 180 });

  doc.setFillColor(255, 252, 248);
  doc.rect(0, 0, 210, 297, "F");
  doc.setDrawColor(190, 0, 39);
  doc.setLineWidth(1);
  doc.rect(14, 14, 182, 269);
  doc.setLineWidth(0.25);
  doc.rect(20, 20, 170, 257);

  const logo = getCertificateLogo();
  const logoHeight = 20;
  const logoWidth = logoHeight * (logo.width / logo.height);
  doc.addImage(logo.dataUrl, "PNG", (210 - logoWidth) / 2, 28, logoWidth, logoHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(190, 0, 39);
  doc.text("MEMBERSHIP RECEIPT", 105, 62, { align: "center" });
  doc.setDrawColor(190, 0, 39);
  doc.line(55, 69, 155, 69);

  doc.addImage(qrDataUrl, "PNG", 155, 30, 24, 24);
  doc.setFontSize(7);
  doc.text("SCAN TO VERIFY", 167, 58, { align: "center" });

  const rows: Array<[string, string]> = [
    ["Receipt No.", receiptNumber],
    ["Member Name", safeText(member.name).toUpperCase()],
    ["Membership ID", safeText(member.membershipId)],
    ["Membership Type", formatMembershipType(member.membershipType)],
    ["Certificate No.", certificateNumber],
    ["Amount Paid", amount],
    ["Payment ID", safeText(member.payment?.paymentId)],
    ["Payment Date", paidAt],
    ["Email", safeText(member.email)],
    ["Phone", safeText(member.phone)],
  ];

  doc.setFontSize(11);
  rows.forEach(([label, value], index) => {
    const y = 88 + index * 13;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(190, 0, 39);
    doc.text(label, 36, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(35, 35, 35);
    addValueText(doc, value, 88, y, 82);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(89, 78, 73);
  doc.text("Thank you for becoming a member of Nisvarthjan Seva Foundation.", 105, 232, { align: "center" });

  doc.setDrawColor(35, 35, 35);
  doc.line(126, 252, 174, 252);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(190, 0, 39);
  doc.text("Authorized Signature", 150, 258, { align: "center" });

  return doc.output("arraybuffer");
}
