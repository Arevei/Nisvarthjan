import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type MemberVerificationDoc = {
  name?: string;
  email?: string;
  phone?: string;
  membershipType?: string;
  membershipId?: string;
  status?: string;
  certificateNumber?: string;
  joinedAt?: Date | string;
  referralAchievement?: {
    tier?: string;
    certificateNumber?: string;
    donationAmount?: number;
    issuedAt?: Date | string;
  } | null;
  payment?: {
    status?: string;
    receipt?: string;
    paidAt?: Date | string;
  };
};

type VisitorCertificateVerificationDoc = {
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string | null;
  title?: string;
  status?: string;
  certificateNumber?: string;
  issuedAt?: Date | string;
};

type DonationReceiptVerificationDoc = {
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string | null;
  purpose?: string;
  receiptNumber?: string;
  status?: string;
  createdAt?: Date | string;
  payment?: {
    status?: string;
    mode?: string;
    paidAt?: Date | string;
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const certificateNumber = searchParams.get("certificateNumber")?.trim();
  const verificationId = searchParams.get("verificationId")?.trim();
  const documentType = searchParams.get("documentType")?.trim() || "membership-certificate";
  const contact = searchParams.get("contact")?.trim();
  const lookupValue = certificateNumber || verificationId;

  if (!lookupValue) {
    return NextResponse.json({ error: "certificateNumber or verificationId is required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    if (documentType === "visitor-certificate") {
      const visitorCertificate = await db
        .collection<VisitorCertificateVerificationDoc>("visitorCertificates")
        .findOne({ certificateNumber: lookupValue });

      if (!visitorCertificate) {
        return NextResponse.json({
          isValid: false,
          documentType,
          verificationId: lookupValue,
          certificateNumber: lookupValue,
          status: "not_found",
        });
      }

      if (
        contact &&
        visitorCertificate.recipientEmail !== contact &&
        visitorCertificate.recipientPhone !== contact
      ) {
        return NextResponse.json({
          isValid: false,
          documentType,
          verificationId: lookupValue,
          certificateNumber: lookupValue,
          status: "not_found",
        });
      }

      return NextResponse.json({
        isValid: visitorCertificate.status === "issued",
        documentType,
        verificationId: lookupValue,
        certificateNumber: visitorCertificate.certificateNumber ?? lookupValue,
        memberName: visitorCertificate.recipientName,
        membershipType: visitorCertificate.title,
        issuedAt: visitorCertificate.issuedAt ? new Date(visitorCertificate.issuedAt).toISOString() : null,
        status: visitorCertificate.status,
      });
    }

    if (documentType === "donation-receipt") {
      const donation = await db
        .collection<DonationReceiptVerificationDoc>("donations")
        .findOne({ receiptNumber: lookupValue });

      if (!donation) {
        return NextResponse.json({
          isValid: false,
          documentType,
          verificationId: lookupValue,
          certificateNumber: lookupValue,
          status: "not_found",
        });
      }

      if (contact && donation.donorEmail !== contact && donation.donorPhone !== contact) {
        return NextResponse.json({
          isValid: false,
          documentType,
          verificationId: lookupValue,
          certificateNumber: lookupValue,
          status: "not_found",
        });
      }

      const status = donation.status || donation.payment?.status || "paid";
      return NextResponse.json({
        isValid: status === "paid",
        documentType,
        verificationId: lookupValue,
        certificateNumber: donation.receiptNumber ?? lookupValue,
        memberName: donation.donorName,
        membershipType: donation.purpose,
        issuedAt: donation.payment?.paidAt
          ? new Date(donation.payment.paidAt).toISOString()
          : donation.createdAt
            ? new Date(donation.createdAt).toISOString()
            : null,
        status,
      });
    }

    if (documentType === "referral-achievement") {
      const member = await db
        .collection<MemberVerificationDoc>("members")
        .findOne({ "referralAchievement.certificateNumber": lookupValue });

      if (!member?.referralAchievement) {
        return NextResponse.json({
          isValid: false,
          documentType,
          verificationId: lookupValue,
          certificateNumber: lookupValue,
          status: "not_found",
        });
      }

      if (contact && member.email !== contact && member.phone !== contact) {
        return NextResponse.json({
          isValid: false,
          documentType,
          verificationId: lookupValue,
          certificateNumber: lookupValue,
          status: "not_found",
        });
      }

      return NextResponse.json({
        isValid: true,
        documentType,
        verificationId: lookupValue,
        certificateNumber: member.referralAchievement.certificateNumber ?? lookupValue,
        memberName: member.name,
        membershipId: member.membershipId,
        membershipType: `${member.referralAchievement.tier ?? "referral"} badge`,
        issuedAt: member.referralAchievement.issuedAt
          ? new Date(member.referralAchievement.issuedAt).toISOString()
          : null,
        status: "issued",
      });
    }

    if (documentType === "membership-receipt") {
      const member = await db
        .collection<MemberVerificationDoc>("members")
        .findOne({ "payment.receipt": lookupValue });

      if (!member) {
        return NextResponse.json({
          isValid: false,
          documentType,
          verificationId: lookupValue,
          certificateNumber: lookupValue,
          status: "not_found",
        });
      }

      if (contact && member.email !== contact && member.phone !== contact) {
        return NextResponse.json({
          isValid: false,
          documentType,
          verificationId: lookupValue,
          certificateNumber: lookupValue,
          status: "not_found",
        });
      }

      const status = member.payment?.status || member.status || "pending";
      return NextResponse.json({
        isValid: status === "paid",
        documentType,
        verificationId: lookupValue,
        certificateNumber: member.payment?.receipt ?? lookupValue,
        memberName: member.name,
        membershipId: member.membershipId,
        membershipType: member.membershipType,
        issuedAt: member.payment?.paidAt ? new Date(member.payment.paidAt).toISOString() : null,
        status,
      });
    }

    const member = await db.collection<MemberVerificationDoc>("members").findOne({ certificateNumber: lookupValue });

    if (!member) {
      return NextResponse.json({
        isValid: false,
        documentType,
        verificationId: lookupValue,
        certificateNumber: lookupValue,
        status: "not_found",
      });
    }

    if (contact && member.email !== contact && member.phone !== contact) {
      return NextResponse.json({
        isValid: false,
        documentType,
        verificationId: lookupValue,
        certificateNumber: lookupValue,
        status: "not_found",
      });
    }

    return NextResponse.json({
      isValid: member.status === "active",
      documentType,
      verificationId: lookupValue,
      certificateNumber: member.certificateNumber ?? lookupValue,
      memberName: member.name,
      membershipId: member.membershipId,
      membershipType: member.membershipType,
      issuedAt: member.joinedAt ? new Date(member.joinedAt).toISOString() : null,
      status: member.status,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to verify certificate" }, { status: 500 });
  }
}
