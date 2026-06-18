import nodemailer from "nodemailer";
import {
  generateMembershipCertificatePdf,
  generateMembershipIdCardPdf,
  generateMembershipReceiptPdf,
  getMembershipReceiptNumber,
  safeFileName,
  safeText,
  type MemberDocumentRecord,
} from "@/lib/membership-documents";
import {
  generateDonationReceiptPdf,
  safeFileName as safeDonationFileName,
  type DonationReceiptRecord,
} from "@/lib/donation-receipts";
import {
  formatAmount as formatReferralAmount,
  generateReferralAchievementCertificatePdf,
  getReferralAchievementTierConfig,
  safeFileName as safeReferralFileName,
  safeText as safeReferralText,
  type ReferralAchievementMember,
} from "@/lib/referral-achievements";

// Admin email for notifications and reply-to
export const ADMIN_EMAIL = "nisvarthjansevango@gmail.com";

// Branded email template wrapper
function wrapEmailTemplate(content: string, title?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title || "Nisvarthjan Seva Foundation"}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #b0112f 0%, #8b0d24 100%); border-radius: 12px 12px 0 0; padding: 24px 28px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                Nisvarthjan Seva Foundation
              </h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.85);">
                Empowering Communities Through Service
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 28px 28px 20px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #18181b; border-radius: 0 0 12px 12px; padding: 24px 28px; text-align: center;">
              <div style="border-top: 2px solid #b0112f; border-bottom: 2px solid #b0112f; padding: 16px 0; margin-bottom: 12px;">
                <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #ffffff;">
                  Nisvarthjan Seva Foundation
                </p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #a1a1aa;">
                  <span style="color: #b0112f;">📧</span> <a href="mailto:${ADMIN_EMAIL}" style="color: #b0112f; text-decoration: none;">${ADMIN_EMAIL}</a>
                </p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #a1a1aa;">
                  <span style="color: #b0112f;">📞</span> +91 98765 43210
                </p>
                <p style="margin: 0; font-size: 12px; color: #71717a;">
                  C/o Mayank Singh Sikarwar, Vill. & Po. Tihar Thana, Rampura, Jalaun, Uttar Pradesh, India, 285127
                </p>
              </div>
              <p style="margin: 0; font-size: 11px; color: #52525b;">
                © ${new Date().getFullYear()} Nisvarthjan Seva Foundation. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are not fully configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function formatAmount(member: MemberDocumentRecord) {
  if (!member.payment?.amount) return "Not available";
  return `INR ${member.payment.amount.toLocaleString("en-IN")}`;
}

export async function sendMembershipPaymentDocumentsEmail(member: MemberDocumentRecord, requestUrl: string) {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!fromAddress) {
    throw new Error("SMTP_FROM or SMTP_USER is not configured.");
  }

  if (!member.email) {
    throw new Error("Member email is not available.");
  }

  const certificatePdf = await generateMembershipCertificatePdf(member, requestUrl);
  const receiptPdf = await generateMembershipReceiptPdf(member, requestUrl);
  const idCardPdf = await generateMembershipIdCardPdf(member, requestUrl);
  const receiptNumber = getMembershipReceiptNumber(member);
  const transporter = getTransporter();

  const content = `
      <h2 style="margin-bottom: 8px;">Nisvarthjan Seva Foundation</h2>
      <p style="margin-top: 0; color: #52525b;">Your membership payment has been received.</p>
      <p>Dear ${safeText(member.name)},</p>
      <p>Your membership is now active. Your receipt, membership certificate, and ID card PDFs are attached with this email.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Membership ID</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${safeText(member.membershipId)}</td></tr>
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Certificate No.</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${safeText(member.certificateNumber)}</td></tr>
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Receipt No.</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${receiptNumber}</td></tr>
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Amount</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${formatAmount(member)}</td></tr>
      </table>
      <p style="color: #52525b;">Thank you for joining us.</p>
    `;

  await transporter.sendMail({
    from: fromAddress,
    to: member.email,
    replyTo: ADMIN_EMAIL,
    subject: "Membership payment receipt and certificate",
    html: wrapEmailTemplate(content),
    attachments: [
      {
        filename: `${safeFileName(safeText(member.certificateNumber))}.pdf`,
        content: Buffer.from(certificatePdf),
        contentType: "application/pdf",
      },
      {
        filename: `${safeFileName(receiptNumber)}.pdf`,
        content: Buffer.from(receiptPdf),
        contentType: "application/pdf",
      },
      {
        filename: `${safeFileName(`${safeText(member.membershipId)}-id-card`)}.pdf`,
        content: Buffer.from(idCardPdf),
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendDonationReceiptEmail(donation: DonationReceiptRecord, requestUrl: string) {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!fromAddress) {
    throw new Error("SMTP_FROM or SMTP_USER is not configured.");
  }

  const receiptPdf = await generateDonationReceiptPdf(donation, requestUrl);
  const transporter = getTransporter();

  const content = `
      <h2 style="margin-bottom: 8px;">Nisvarthjan Seva Foundation</h2>
      <p style="margin-top: 0; color: #52525b;">Thank you for your donation.</p>
      <p>Dear ${donation.donorName},</p>
      <p>Your 80G donation receipt PDF is attached with this email.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Receipt No.</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${donation.receiptNumber}</td></tr>
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Donor PAN</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${donation.donorPan || "Not provided"}</td></tr>
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Amount</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">INR ${donation.amount.toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Purpose</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${donation.purpose}</td></tr>
      </table>
      <p style="color: #52525b;">This receipt contains a QR code for online verification.</p>
    `;

  await transporter.sendMail({
    from: fromAddress,
    to: donation.donorEmail,
    replyTo: ADMIN_EMAIL,
    subject: "80G donation receipt - Nisvarthjan Seva Foundation",
    html: wrapEmailTemplate(content),
    attachments: [
      {
        filename: `${safeDonationFileName(donation.receiptNumber)}.pdf`,
        content: Buffer.from(receiptPdf),
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendBirthdayWishEmail(member: { name?: string; email?: string }) {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!fromAddress) {
    throw new Error("SMTP_FROM or SMTP_USER is not configured.");
  }

  if (!member.email) {
    throw new Error("Member email is not available.");
  }

  const transporter = getTransporter();

  const content = `
      <h2 style="margin-bottom: 8px;">Nisvarthjan Seva Foundation</h2>
      <p>Dear ${safeText(member.name)},</p>
      <p>Wishing you a very happy birthday. May your year ahead be filled with health, joy, and meaningful service.</p>
      <p style="color: #52525b;">Thank you for being part of the Nisvarthjan Seva Foundation family.</p>
    `;

  await transporter.sendMail({
    from: fromAddress,
    to: member.email,
    replyTo: ADMIN_EMAIL,
    subject: "Happy birthday from Nisvarthjan Seva Foundation",
    html: wrapEmailTemplate(content),
  });
}

export async function sendReferralAchievementEmail(member: ReferralAchievementMember, requestUrl: string) {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!fromAddress) {
    throw new Error("SMTP_FROM or SMTP_USER is not configured.");
  }

  if (!member.email) {
    throw new Error("Member email is not available.");
  }

  if (!member.referralAchievement) {
    throw new Error("Referral achievement is not allotted.");
  }

  const achievement = member.referralAchievement;
  const tier = getReferralAchievementTierConfig(achievement.tier);
  const pdf = await generateReferralAchievementCertificatePdf(member, requestUrl);
  const transporter = getTransporter();

  const content = `
      <h2 style="margin-bottom: 8px;">Nisvarthjan Seva Foundation</h2>
      <p style="margin-top: 0; color: #52525b;">Congratulations on your referral achievement.</p>
      <p>Dear ${safeReferralText(member.name)},</p>
      <p>You have been awarded the <strong>${tier.label} Badge</strong> for collecting ${formatReferralAmount(achievement.donationAmount)} through donation referrals.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Certificate No.</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${achievement.certificateNumber}</td></tr>
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Membership ID</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${safeReferralText(member.membershipId)}</td></tr>
        <tr><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">Badge</td><td style="padding: 6px 10px; border: 1px solid #e4e4e7;">${tier.label}</td></tr>
      </table>
      <p style="color: #52525b;">Your certificate PDF is attached.</p>
    `;

  await transporter.sendMail({
    from: fromAddress,
    to: member.email,
    replyTo: ADMIN_EMAIL,
    subject: `${tier.label} referral achievement certificate`,
    html: wrapEmailTemplate(content),
    attachments: [
      {
        filename: `${safeReferralFileName(achievement.certificateNumber)}.pdf`,
        content: Buffer.from(pdf),
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendEnquiryAutoResponseEmail(enquiry: { name: string; email: string; message: string }) {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!fromAddress) {
    throw new Error("SMTP_FROM or SMTP_USER is not configured.");
  }

  const transporter = getTransporter();

  const content = `
      <h2 style="margin-bottom: 8px;">Nisvarthjan Seva Foundation</h2>
      <p>Dear ${safeText(enquiry.name)},</p>
      <p>Thank you for contacting us. We have received your enquiry and our team will get back to you soon.</p>
      <div style="margin: 16px 0; padding: 12px; border: 1px solid #e4e4e7; border-radius: 8px; background: #fafafa;">
        <p style="margin: 0; color: #52525b;">${safeText(enquiry.message)}</p>
      </div>
      <p style="color: #52525b;">Thank you for reaching out.</p>
    `;

  await transporter.sendMail({
    from: fromAddress,
    to: enquiry.email,
    replyTo: ADMIN_EMAIL,
    subject: "We received your enquiry - Nisvarthjan Seva Foundation",
    html: wrapEmailTemplate(content),
  });
}
