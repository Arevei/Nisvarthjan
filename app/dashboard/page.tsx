"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  Gift,
  HeartHandshake,
  Lock,
  LogOut,
  Medal,
  QrCode,
  Shield,
  User,
  Users,
} from "lucide-react";

type AchievementTier = "silver" | "gold" | "platinum" | "diamond";

type AchievementStatus = {
  stats: {
    membershipReferralCount: number;
    donationReferralCount: number;
    donationAmount: number;
  };
  currentAchievement: {
    tier: AchievementTier;
    certificateNumber: string;
    membershipReferralCount?: number;
    donationReferralCount?: number;
    donationAmount: number;
    thresholdAmount: number;
    issuedAt: string;
    updatedAt?: string;
    source: "automatic" | "admin";
  } | null;
  tiers: Array<{
    tier: AchievementTier;
    label: string;
    membershipReferralCount: number;
    donationReferralCount: number;
    thresholdAmount: number;
    unlocked: boolean;
  }>;
};

const tierStyles: Record<AchievementTier | "pending", { label: string; badge: string; panel: string; mark: string }> = {
  pending: {
    label: "Badge Pending",
    badge: "border-white/50 bg-white/15 text-white",
    panel: "border-zinc-200 bg-zinc-50",
    mark: "bg-zinc-200 text-zinc-700",
  },
  silver: {
    label: "Silver Badge",
    badge: "border-zinc-200 bg-zinc-100 text-zinc-800",
    panel: "border-zinc-200 bg-zinc-50",
    mark: "bg-zinc-700 text-white",
  },
  gold: {
    label: "Gold Badge",
    badge: "border-amber-200 bg-amber-100 text-amber-900",
    panel: "border-amber-200 bg-amber-50",
    mark: "bg-amber-500 text-white",
  },
  platinum: {
    label: "Platinum Badge",
    badge: "border-sky-200 bg-sky-100 text-sky-900",
    panel: "border-sky-200 bg-sky-50",
    mark: "bg-sky-700 text-white",
  },
  diamond: {
    label: "Diamond Badge",
    badge: "border-cyan-200 bg-cyan-100 text-cyan-900",
    panel: "border-cyan-200 bg-cyan-50",
    mark: "bg-cyan-600 text-white",
  },
};

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
        ? "Your membership is complete. You can download your documents below."
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

function formatMoney(amount: number) {
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function formatAchievementTier(tier: string) {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [birthdayEmailStatus, setBirthdayEmailStatus] = useState<"idle" | "sent" | "failed" | "alreadySent">("idle");
  const [copiedLink, setCopiedLink] = useState<"membership" | "donation" | "code" | null>(null);
  const [achievementStatus, setAchievementStatus] = useState<AchievementStatus | null>(null);

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

  useEffect(() => {
    if (!user) return;

    const loadAchievementStatus = async () => {
      try {
        const response = await fetch("/api/referral-achievement/status", { credentials: "include" });
        if (!response.ok) return;
        const payload = (await response.json()) as AchievementStatus;
        setAchievementStatus(payload);
      } catch {
        setAchievementStatus(null);
      }
    };

    void loadAchievementStatus();
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl animate-pulse space-y-4">
            <div className="h-56 rounded-2xl bg-muted" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-36 rounded-xl bg-muted" />
              <div className="h-36 rounded-xl bg-muted" />
              <div className="h-36 rounded-xl bg-muted" />
            </div>
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

  const referralAchievement = achievementStatus?.currentAchievement ?? user.referralAchievement;
  const currentTier = referralAchievement?.tier ?? "pending";
  const currentTierStyle = tierStyles[currentTier];
  const statusInfo = getMembershipStatus(user.status, Boolean(user.certificateNumber));
  const isMembershipComplete = user.status === "active" && Boolean(user.certificateNumber);
  const baseUrl = typeof window === "undefined" ? "" : window.location.origin;
  const referralCode = encodeURIComponent(user.membershipId);
  const displayReferralCode = user.membershipId;
  const referralLinks = {
    membership: `${baseUrl}/membership?ref=${referralCode}`,
    donation: `${baseUrl}/donate?ref=${referralCode}`,
    campaignExample: `${baseUrl}/campaigns/[campaign-id]?ref=${referralCode}`,
  };
  const copyReferralLink = async (type: "membership" | "donation" | "code") => {
    const text = type === "code" ? displayReferralCode : referralLinks[type];
    await navigator.clipboard.writeText(text);
    setCopiedLink(type);
    window.setTimeout(() => setCopiedLink(null), 1800);
  };
  const membershipSteps = [
    { label: "Application submitted", detail: "Your details are saved.", icon: CheckCircle2 },
    { label: "Foundation approval", detail: "Foundation team review.", icon: Clock },
    { label: "Payment", detail: "Complete membership fee.", icon: CreditCard },
    { label: "Certificate", detail: "Issued after activation.", icon: Award },
  ];
  const profileInitials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Member workspace</p>
            <h1 className="text-3xl font-serif font-bold text-foreground">{t("Member Dashboard", "Member Dashboard")}</h1>
          </div>
          <Button data-testid="button-logout" variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("Logout", "Logout")}
          </Button>
        </div>

        <section className="relative overflow-hidden rounded-2xl border bg-foreground text-background shadow-sm">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-primary/30" />
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_280px] md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-bold shadow-inner">
                {profileInitials || <User className="h-10 w-10" />}
              </div>
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase ${currentTierStyle.badge}`}>
                    <Medal className="mr-1.5 h-3.5 w-3.5" />
                    {currentTierStyle.label}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-white">
                    {formatStatusLabel(user.status)}
                  </span>
                </div>
                <h2 data-testid="text-member-name" className="break-words text-3xl font-serif font-bold md:text-4xl">
                  {user.name}
                </h2>
                <p data-testid="text-member-email" className="mt-2 break-all text-sm text-white/75">{user.email}</p>
                <div className="mt-5 grid gap-3 text-sm text-white/80 sm:grid-cols-3">
                  <div>
                    <p className="text-white/50">Membership ID</p>
                    <p data-testid="text-membership-id" className="font-mono font-bold text-white">{user.membershipId}</p>
                  </div>
                  <div>
                    <p className="text-white/50">Member Type</p>
                    <p className="font-semibold text-white">{formatStatusLabel(user.membershipType)} Member</p>
                  </div>
                  <div>
                    <p className="text-white/50">Joined On</p>
                    <p className="font-semibold text-white">{formatDate(user.joinedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-4 text-foreground ${currentTierStyle.panel}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">Profile Badge</p>
                  <h3 className="mt-1 text-lg font-bold">{currentTierStyle.label}</h3>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${currentTierStyle.mark}`}>
                  <Medal className="h-5 w-5" />
                </span>
              </div>
              {referralAchievement ? (
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-muted-foreground">Allotted certificate</p>
                  <p className="break-all font-mono font-semibold text-foreground">{referralAchievement.certificateNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Donation collection: {formatMoney(referralAchievement.donationAmount)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Silver, Gold, Platinum, and Diamond badges unlock from referral and donation achievements.
                </p>
              )}
            </div>
          </div>
        </section>

        {hasBirthdayToday && (
          <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950 shadow-sm">
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
          </section>
        )}

        {!isMembershipComplete && (
          <section data-testid="membership-status-panel" className={`mt-6 rounded-xl border p-6 ${statusInfo.tone}`}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold">{t(statusInfo.title, statusInfo.title)}</h2>
                    <p className="mt-1 text-sm">{t(statusInfo.description, statusInfo.description)}</p>
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
                        isDone ? "border-green-200" : isCurrent ? "border-primary/40" : "border-black/10 opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            isDone ? "bg-green-100 text-green-700" : isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
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
          </section>
        )}

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {isMembershipComplete && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase text-primary">Digital ID</p>
                  <h3 className="mt-1 text-xl font-bold text-foreground">Membership ID Card</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Professional member identity card with QR verification.</p>
                </div>
                <Button asChild data-testid="button-download-id-card">
                  <a href="/api/membership-id-cards/download">
                    <Download className="mr-2 h-4 w-4" />
                    Download ID Card
                  </a>
                </Button>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border bg-white">
                <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase">Nisvarthjan Seva Foundation</span>
                  </div>
                  <QrCode className="h-5 w-5" />
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-[88px_1fr]">
                  <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed border-primary/35 bg-primary/5 text-center text-[10px] font-bold uppercase text-primary">
                    Member Photo
                  </div>
                  <div className="min-w-0">
                    <p className="break-words text-lg font-bold uppercase text-foreground">{user.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">{formatStatusLabel(user.membershipType)} Member</p>
                    <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Membership ID</dt>
                        <dd className="font-mono font-bold text-primary">{user.membershipId}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Certificate</dt>
                        <dd className="break-all font-mono font-bold text-primary">{user.certificateNumber}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 px-4 pb-4 text-center text-[10px] text-muted-foreground">
                  <div className="border-t pt-1">Member Signature</div>
                  <div className="border-t pt-1">Authority Signature</div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-primary">Download Center</p>
            <h3 className="mt-1 text-xl font-bold text-foreground">Allotted Documents</h3>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">Membership Certificate</p>
                    <p data-testid="text-certificate-number" className="mt-1 break-all font-mono text-sm font-bold text-primary">
                      {user.certificateNumber || "Certificate pending"}
                    </p>
                  </div>
                  <Award className="h-5 w-5 text-primary" />
                </div>
                {user.status === "active" && user.certificateNumber && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild data-testid="button-download-cert" size="sm" variant="outline">
                      <a href="/api/certificates/download">
                        <Download className="mr-2 h-4 w-4" />
                        Certificate
                      </a>
                    </Button>
                    <Button asChild data-testid="button-verify-cert" size="sm" variant="outline">
                      <a href={`/verify/${encodeURIComponent(user.certificateNumber)}`}>
                        <Shield className="mr-2 h-4 w-4" />
                        Verify
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">Membership Receipt</p>
                    <p className="mt-1 text-sm text-muted-foreground">Fee receipt PDF with QR verification.</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                {user.status === "active" && user.certificateNumber && (
                  <Button asChild data-testid="button-download-receipt" size="sm" variant="outline" className="mt-3">
                    <a href="/api/membership-receipts/download">
                      <Download className="mr-2 h-4 w-4" />
                      Receipt
                    </a>
                  </Button>
                )}
              </div>

              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">Achievement Certificate</p>
                    <p className="mt-1 break-all font-mono text-sm font-bold text-primary">
                      {referralAchievement?.certificateNumber || "Not allotted yet"}
                    </p>
                  </div>
                  <Medal className="h-5 w-5 text-primary" />
                </div>
                {referralAchievement && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <a href="/api/referral-achievement/download">
                      <Download className="mr-2 h-4 w-4" />
                      Achievement
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Mobile</dt>
                <dd className="mt-1 font-medium text-foreground">{user.phone || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Date of Birth</dt>
                <dd className="mt-1 font-medium text-foreground">{formatDate(user.dateOfBirth)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">City</dt>
                <dd className="mt-1 font-medium text-foreground">{user.city || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">State</dt>
                <dd className="mt-1 font-medium text-foreground">{user.state || "Not available"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Address</dt>
                <dd className="mt-1 font-medium text-foreground">{user.address || "Not available"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Donation History</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Download your paid donation statement linked to your registered email.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full">
              <a href="/api/donation-history/download">
                <Download className="mr-2 h-4 w-4" />
                Download History PDF
              </a>
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Medal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Badge & Certificate Progress</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Silver, Gold, Platinum, and Diamond certificates unlock when referral and donation targets are reached.
              </p>
            </div>
          </div>

          {achievementStatus ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {achievementStatus.tiers.map((tier) => {
                const style = tierStyles[tier.tier];
                const membershipProgress = Math.min(
                  100,
                  (achievementStatus.stats.membershipReferralCount / tier.membershipReferralCount) * 100,
                );
                const donationProgress = Math.min(
                  100,
                  (achievementStatus.stats.donationReferralCount / tier.donationReferralCount) * 100,
                );
                const amountProgress = Math.min(100, (achievementStatus.stats.donationAmount / tier.thresholdAmount) * 100);

                return (
                  <div key={tier.tier} className={`rounded-xl border p-4 ${style.panel}`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${style.mark}`}>
                          <Medal className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{tier.label} Badge</p>
                          <p className="text-xs text-muted-foreground">Achievement Certificate</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          tier.unlocked ? "bg-green-100 text-green-800" : "bg-white/80 text-zinc-700"
                        }`}
                      >
                        {tier.unlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        {tier.unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="mb-1 flex justify-between gap-3">
                          <span className="text-muted-foreground">Membership referrals</span>
                          <span className="font-medium text-foreground">
                            {achievementStatus.stats.membershipReferralCount}/{tier.membershipReferralCount}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${membershipProgress}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between gap-3">
                          <span className="text-muted-foreground">Donation referrals</span>
                          <span className="font-medium text-foreground">
                            {achievementStatus.stats.donationReferralCount}/{tier.donationReferralCount}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${donationProgress}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between gap-3">
                          <span className="text-muted-foreground">Donation collection</span>
                          <span className="font-medium text-foreground">
                            {formatMoney(achievementStatus.stats.donationAmount)}/{formatMoney(tier.thresholdAmount)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${amountProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">Loading certificate progress...</p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Referral Links</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Share these links so new members and donations are credited to your membership ID.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Membership Referral</h4>
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
                <h4 className="text-sm font-semibold text-foreground">Donation Referral</h4>
              </div>
              <p className="break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{referralLinks.donation}</p>
              <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => copyReferralLink("donation")}>
                <Copy className="mr-2 h-4 w-4" />
                {copiedLink === "donation" ? "Copied" : "Copy Link"}
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-foreground">Campaign donation referral</p>
                <p className="mt-1">
                  For any campaign, share the campaign URL with <span className="font-mono text-foreground">?ref={displayReferralCode}</span>.
                  Example: <span className="break-all font-mono text-foreground">{referralLinks.campaignExample}</span>
                </p>
                <p className="mt-2">
                  When the donor completes payment, the donation is stored with your referral code. Admin can then see how many members you added,
                  how many donors you referred, and how much donation amount was collected through you.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => copyReferralLink("code")} className="shrink-0">
                <Copy className="mr-2 h-4 w-4" />
                {copiedLink === "code" ? "Copied" : "Copy Code"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
