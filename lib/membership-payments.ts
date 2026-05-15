export type MembershipType = "general" | "active" | "lifetime";
export type PaymentMode = "manual" | "razorpay";

export const membershipFees: Record<MembershipType, number> = {
  general: 500,
  active: 1100,
  lifetime: 5100,
};

export function getMembershipFee(type: string | undefined) {
  if (type === "active" || type === "lifetime" || type === "general") {
    return membershipFees[type];
  }

  return membershipFees.general;
}

export function getPaymentMode(): PaymentMode {
  return process.env.PAYMENT_MODE === "razorpay" ? "razorpay" : "manual";
}

export function generateCertificateNumber() {
  return `CERT-NSF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`;
}
