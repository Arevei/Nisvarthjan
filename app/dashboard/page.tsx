"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { User, Award, Calendar, LogOut, Shield, Download, CheckCircle2, Clock, CreditCard, AlertCircle, BadgeCheck, QrCode, Gift, Copy, HeartHandshake, Users } from "lucide-react";

function formatStatusLabel(status: string) {
  return status
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getMembershipStatus(status: string, hasCertificate: boolean) {
  if (status === "active") {
    return {
      title: hasCertificate ? "Membership active" : "Membership active, certificate pending",
      description: hasCertificate
        ? "Your membership is complete. You can download your certificate below."
        : "Your membership is active. The certificate will appear here after it is issued by the foundation team.",
      tone: "border-green-200 bg-green-50 text-green-900",
      badge: "bg-green-100 text-green-800",
      completedSteps: hasCertificate ? 4 : 3,
      currentStep: 4,
    };
  }

  if (status === "payment_pending") {
    return {
      title: "Payment pending",
      description: "Your membership is approved. Please complete the payment step shared by the foundation team.",
      tone: "border-amber-200 bg-amber-50 text-amber-950",
      badge: "bg-amber-100 text-amber-800",
      completedSteps: 2,
      currentStep: 3,
    };
  }

  if (status === "suspended" || status === "inactive") {
    return {
      title: "Membership not active",
      description: "Please contact support to understand what is needed to restore your membership.",
      tone: "border-red-200 bg-red-50 text-red-950",
      badge: "bg-red-100 text-red-800",
      completedSteps: 1,
      currentStep: 2,
    };
  }

  return {
    title: "Application under review",
    description: "Your membership request has been submitted. Foundation approval is the next step.",
    tone: "border-blue-200 bg-blue-50 text-blue-950",
    badge: "bg-blue-100 text-blue-800",
    completedSteps: 1,
    currentStep: 2,
  };
}

function isBirthdayToday(dateOfBirth?: string | null) {
  if (!dateOfBirth) return false;

  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return date.getUTCDate() === today.getDate() && date.getUTCMonth() === today.getMonth();
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [birthdayEmailStatus, setBirthdayEmailStatus] = useState<"idle" | "sent" | "failed" | "alreadySent">("idle");
  const [copiedLink, setCopiedLink] = useState<"membership" | "donation" | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const hasBirthdayToday = isBirthdayToday(user?.dateOfBirth);

  useEffect(() => {
    if (!user || !hasBirthdayToday) return;

    const sendWish = async () => {
      try {
        const response = await fetch("/api/birthday-wishes", {
          method: "POST",
          credentials: "include",
        });
        const payload = (await response.json()) as { emailSent?: boolean; alreadySent?: boolean };
        if (payload.emailSent) {
          setBirthdayEmailStatus("sent");
        } else if (payload.alreadySent) {
          setBirthdayEmailStatus("alreadySent");
        } else {
          setBirthdayEmailStatus(response.ok ? "idle" : "failed");
        }
      } catch {
        setBirthdayEmailStatus("failed");
      }
    };

    void sendWish();
  }, [user, hasBirthdayToday]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse max-w-2xl mx-auto space-y-4">
            <div className="h-32 bg-muted rounded-2xl" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const statusInfo = getMembershipStatus(user.status, Boolean(user.certificateNumber));
  const isMembershipComplete = user.status === "active" && Boolean(user.certificateNumber);
  const baseUrl = typeof window === "undefined" ? "" : window.location.origin;
  const referralCode = encodeURIComponent(user.membershipId);
  const referralLinks = {
    membership: `${baseUrl}/membership?ref=${referralCode}`,
    donation: `${baseUrl}/donate?ref=${referralCode}`,
  };
  const copyReferralLink = async (type: "membership" | "donation") => {
    await navigator.clipboard.writeText(referralLinks[type]);
    setCopiedLink(type);
    window.setTimeout(() => setCopiedLink(null), 1800);
  };
  const membershipSteps = [
    {
      label: "Application submitted",
      detail: "Your details are saved.",
      icon: CheckCircle2,
    },
    {
      label: "Foundation approval",
      detail: "Foundation team review.",
      icon: Clock,
    },
    {
      label: "Payment",
      detail: "Complete membership fee.",
      icon: CreditCard,
    },
    {
      label: "Certificate",
      detail: "Issued after activation.",
      icon: Award,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">{t("Member Dashboard", "सदस्य डैशबोर्ड")}</h1>
          <Button data-testid="button-logout" variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> {t("Logout", "लॉगआउट")}
          </Button>
        </div>

        <div className="grid ">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-8 mb-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 data-testid="text-member-name" className="text-2xl font-serif font-bold mb-1">{user.name}</h2>
                <p data-testid="text-member-email" className="text-primary-foreground/80 mb-3">{user.email}</p>
                
              </div>
            </div>
          </div>

          {hasBirthdayToday && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-950 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Happy birthday, {user.name}!</h2>
                  <p className="mt-1 text-sm text-rose-900/80">
                    Wishing you health, joy, and a meaningful year of service with Nisvarthjan Seva Foundation.
                  </p>
                  {birthdayEmailStatus === "sent" && (
                    <p className="mt-2 text-xs font-semibold text-rose-800">A birthday wish email has also been sent to you.</p>
                  )}
                  {birthdayEmailStatus === "alreadySent" && (
                    <p className="mt-2 text-xs font-semibold text-rose-800">Your birthday wish email was already sent for this year.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Referral Links</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share these links so new members and donations are tracked against your membership ID.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border bg-background p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Membership Referral</h3>
                </div>
                <p className="break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{referralLinks.membership}</p>
                <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => copyReferralLink("membership")}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedLink === "membership" ? "Copied" : "Copy Link"}
                </Button>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <div className="mb-3 flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Donation Referral</h3>
                </div>
                <p className="break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{referralLinks.donation}</p>
                <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => copyReferralLink("donation")}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedLink === "donation" ? "Copied" : "Copy Link"}
                </Button>
              </div>
            </div>
          </div>

          {isMembershipComplete && (
            <div className="mb-6 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="overflow-hidden rounded-xl border bg-white">
                <div className="flex items-center gap-2 bg-primary px-3 py-2 text-primary-foreground">
                  <BadgeCheck className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">Membership ID Card</span>
                </div>
                <div className="grid grid-cols-[72px_1fr] gap-3 p-3">
                  <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-primary/40 bg-primary/5 text-center text-[10px] font-semibold uppercase text-primary">
                    Paste Photo
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{formatStatusLabel(user.membershipType)} Member</p>
                    <p className="mt-2 font-mono text-xs font-semibold text-primary">{user.membershipId}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Verification QR on back</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 px-3 pb-3 text-center text-[10px] text-muted-foreground">
                  <div className="border-t pt-1">Member Signature</div>
                  <div className="border-t pt-1">Authority Signature</div>
                </div>
              </div>
              <Button asChild data-testid="button-download-id-card" className="mt-4 w-full">
                <a href="/api/membership-id-cards/download">
                  <Download className="w-4 h-4 mr-2" />
                  {t("Download ID Card", "Download ID Card")}
                </a>
              </Button>
            </div>
          )}
        </div>

        {!isMembershipComplete && (
        <div data-testid="membership-status-panel" className={`border rounded-xl p-6 mb-6 ${statusInfo.tone}`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-lg">{t(statusInfo.title, statusInfo.title)}</h2>
                  <p className="text-sm mt-1">{t(statusInfo.description, statusInfo.description)}</p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusInfo.badge}`}>
                {formatStatusLabel(user.status)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {membershipSteps.map((step, index) => {
                const stepNumber = index + 1;
                const StepIcon = step.icon;
                const isDone = stepNumber <= statusInfo.completedSteps;
                const isCurrent = !isDone && stepNumber === statusInfo.currentStep;

                return (
                  <div
                    key={step.label}
                    className={`rounded-lg border bg-white/70 p-3 ${
                      isDone
                        ? "border-green-200"
                        : isCurrent
                          ? "border-primary/40"
                          : "border-black/10 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${
                          isDone
                            ? "bg-green-100 text-green-700"
                            : isCurrent
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <StepIcon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold">{t(step.label, step.label)}</span>
                    </div>
                    <p className="mt-2 text-xs opacity-80">{t(step.detail, step.detail)}</p>
                    <p className="mt-2 text-xs font-semibold">
                      {isDone ? t("Done", "Done") : isCurrent ? t("Next step", "Next step") : t("Remaining", "Remaining")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t("Membership ID", "सदस्यता आईडी")}</h3>
            </div>
            <p data-testid="text-membership-id" className="font-mono text-lg font-bold text-primary">{user.membershipId}</p>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t("Member Since", "सदस्य तब से")}</h3>
            </div>
            <p className="font-medium text-foreground">{new Date(user.joinedAt).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        {user.status === "active" && user.certificateNumber && (
          <div className="bg-card border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t("Membership Certificate", "सदस्यता प्रमाणपत्र")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{t("Certificate Number:", "प्रमाणपत्र संख्या:")}</p>
            <p data-testid="text-certificate-number" className="font-mono text-primary font-bold mb-4">{user.certificateNumber}</p>
            <Button asChild data-testid="button-download-cert" variant="outline" className="border-primary text-primary hover:bg-primary/5">
              <a href="/api/certificates/download">
                <Download className="w-4 h-4 mr-2" />
                {t("Download Certificate", "प्रमाणपत्र डाउनलोड करें")}
              </a>
            </Button>
            <Button asChild data-testid="button-download-receipt" variant="outline" className="mt-3 sm:ml-3">
              <a href="/api/membership-receipts/download">
                <Download className="w-4 h-4 mr-2" />
                {t("Download Receipt", "Download Receipt")}
              </a>
            </Button>
            <Button asChild data-testid="button-download-id-card-secondary" variant="outline" className="mt-3 sm:ml-3">
              <a href="/api/membership-id-cards/download">
                <Download className="w-4 h-4 mr-2" />
                {t("Download ID Card", "Download ID Card")}
              </a>
            </Button>
            <Button asChild data-testid="button-verify-cert" variant="outline" className="mt-3">
              <a href={`/verify/${encodeURIComponent(user.certificateNumber)}`}>
                <Shield className="w-4 h-4 mr-2" />
                {t("Verify Online", "Verify Online")}
              </a>
            </Button>
          </div>
        )}

        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">{t("Personal Information", "व्यक्तिगत जानकारी")}</h3>
          <dl className="grid md:grid-cols-2 gap-4 text-sm">
            {user.phone && <div><dt className="text-muted-foreground">{t("Mobile", "मोबाइल")}</dt><dd className="font-medium text-foreground mt-1">{user.phone}</dd></div>}
            {user.city && <div><dt className="text-muted-foreground">{t("City", "शहर")}</dt><dd className="font-medium text-foreground mt-1">{user.city}</dd></div>}
            {user.state && <div><dt className="text-muted-foreground">{t("State", "राज्य")}</dt><dd className="font-medium text-foreground mt-1">{user.state}</dd></div>}
            {user.address && <div className="md:col-span-2"><dt className="text-muted-foreground">{t("Address", "पता")}</dt><dd className="font-medium text-foreground mt-1">{user.address}</dd></div>}
          </dl>
        </div>
      </div>
    </Layout>
  );
}


