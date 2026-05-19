import { readFileSync } from "fs";
import path from "path";
import { jsPDF } from "jspdf";

export type DonationHistoryRecord = {
  id: number;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string | null;
  campaignId?: number | null;
  campaignTitle?: string | null;
  purpose: string;
  receiptNumber: string;
  status?: string;
  createdAt: Date | string;
  payment?: {
    mode?: string;
    status?: string;
    paymentId?: string;
    paidAt?: Date | string;
  };
};

export function safeFileName(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "donation-history";
}

function formatDate(value: Date | string | undefined) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPngDimensions(buffer: Buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getLogo() {
  const logoPath = path.join(process.cwd(), "public", "brand", "footer-logo.png");
  const logoBuffer = readFileSync(logoPath);

  return {
    dataUrl: `data:image/png;base64,${logoBuffer.toString("base64")}`,
    ...getPngDimensions(logoBuffer),
  };
}

function addHeader(doc: jsPDF, donorName: string, donorEmail: string, totalAmount: number) {
  doc.setFillColor(255, 252, 248);
  doc.rect(0, 0, 210, 297, "F");

  const logo = getLogo();
  const logoHeight = 18;
  const logoWidth = logoHeight * (logo.width / logo.height);
  doc.addImage(logo.dataUrl, "PNG", 18, 14, logoWidth, logoHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(190, 0, 39);
  doc.text("Donation History", 18, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(63, 63, 70);
  doc.text(`Donor: ${donorName}`, 18, 55);
  doc.text(`Email: ${donorEmail}`, 18, 62);
  doc.text(`Total Paid Donations: INR ${totalAmount.toLocaleString("en-IN")}`, 18, 69);
  doc.text(`Generated: ${formatDate(new Date())}`, 18, 76);

  doc.setDrawColor(190, 0, 39);
  doc.line(18, 84, 192, 84);
}

function addTableHeader(doc: jsPDF, y: number) {
  doc.setFillColor(190, 0, 39);
  doc.rect(18, y - 6, 174, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Date", 21, y);
  doc.text("Receipt", 43, y);
  doc.text("Purpose / Campaign", 80, y);
  doc.text("Mode", 145, y);
  doc.text("Amount", 172, y, { align: "right" });
}

export function generateDonationHistoryPdf(donations: DonationHistoryRecord[], donorName: string, donorEmail: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const paidDonations = donations.filter((donation) => (donation.status || donation.payment?.status || "paid") === "paid");
  const totalAmount = paidDonations.reduce((total, donation) => total + donation.amount, 0);

  addHeader(doc, donorName, donorEmail, totalAmount);
  addTableHeader(doc, 96);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(39, 39, 42);

  let y = 106;
  paidDonations.forEach((donation, index) => {
    if (y > 270) {
      doc.addPage();
      addHeader(doc, donorName, donorEmail, totalAmount);
      addTableHeader(doc, 96);
      y = 106;
    }

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(18, y - 6, 174, 9, "F");
    }

    const purpose = donation.campaignTitle || donation.purpose;
    const paidAt = donation.payment?.paidAt || donation.createdAt;
    doc.setTextColor(39, 39, 42);
    doc.text(formatDate(paidAt), 21, y);
    doc.text(donation.receiptNumber, 43, y, { maxWidth: 34 });
    doc.text(doc.splitTextToSize(purpose, 58).slice(0, 1), 80, y);
    doc.text((donation.payment?.mode || "manual").replace(/_/g, " "), 145, y, { maxWidth: 22 });
    doc.text(`INR ${donation.amount.toLocaleString("en-IN")}`, 172, y, { align: "right" });
    y += 10;
  });

  if (paidDonations.length === 0) {
    doc.text("No paid donation history found.", 18, 108);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(89, 78, 73);
  doc.text("This statement lists paid donations recorded by Nisvarthjan Seva Foundation.", 105, 286, {
    align: "center",
  });

  return doc.output("arraybuffer");
}
