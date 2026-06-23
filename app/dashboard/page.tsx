"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { loadRazorpayScript, type RazorpaySuccess } from "@/lib/razorpay-client";
import type { ActiveEnquiry } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Award,
  BadgeCheck,
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
  MessageSquare,
  QrCode,
  Send,
  Shield,
  User,
} from "lucide-react";

type AchievementTier = "silver" | "gold" | "platinum" | "diamond";

const tierBadgeImages: Record<AchievementTier, string> = {
  silver: "/achievement-badges/silver.png",
  gold: "/achievement-badges/gold.png",
  platinum: "/achievement-badges/platinum.png",
  diamond: "/achievement-badges/diamond.png",
};

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
      completedSteps: 1,
      currentStep: 2,
    };
  }

  if (status === "approval_pending") {
    return {
      title: "Admin approval pending",
      description: "Your payment is confirmed. The foundation team will activate your account and email your certificate and ID card after approval.",
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

function progressPercent(value: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function enquiryStatusClass(status: ActiveEnquiry["status"]) {
  if (status === "new") return "bg-blue-100 text-blue-800";
  if (status === "in_review") return "bg-amber-100 text-amber-800";
  if (status === "replied") return "bg-emerald-100 text-emerald-800";
  return "bg-muted text-muted-foreground";
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [birthdayEmailStatus, setBirthdayEmailStatus] = useState<"idle" | "sent" | "failed" | "alreadySent">("idle");
  const [copiedLink, setCopiedLink] = useState<"website" | "code" | null>(null);
  const [achievementStatus, setAchievementStatus] = useState<AchievementStatus | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const startRazorpayPayment = async () => {
    if (!user || !user.payment) return;

    setIsPaying(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setIsPaying(false);
      toast({ title: "Unable to load Razorpay checkout", variant: "destructive" });
      return;
    }

    const checkout = new window.Razorpay({
      key: user.payment.keyId || "",
      amount: user.payment.amount * 100,
      currency: user.payment.currency,
      name: "Nisvarthjan Seva Foundation",
      description: `${user.membershipType} membership fee`,
      order_id: user.payment.orderId,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      notes: {
        memberId: String(user.id),
        membershipId: user.membershipId,
      },
      theme: { color: "#be0027" },
      handler: async (response: RazorpaySuccess) => {
        try {
          const verifyResponse = await fetch("/api/membership-payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              memberId: user.id,
              ...response,
            }),
          });

          const payload = await verifyResponse.json();
          if (!verifyResponse.ok) {
            throw new Error(payload.error || "Payment verification failed");
          }

          toast({ title: "Payment confirmed. Admin approval is pending." });
          window.location.reload();
        } catch (error) {
          toast({
            title: error instanceof Error ? error.message : "Payment verification failed",
            variant: "destructive",
          });
        } finally {
          setIsPaying(false);
        }
      },
      modal: {
        ondismiss: () => setIsPaying(false),
      },
    });

    checkout.open();
  };
  const [updatedEnquiries, setUpdatedEnquiries] = useState<Record<number, ActiveEnquiry>>({});
  const [enquiryReplyDrafts, setEnquiryReplyDrafts] = useState<Record<number, string>>({});
  const [enquiryBusyId, setEnquiryBusyId] = useState<number | null>(null);
  const [enquiryError, setEnquiryError] = useState("");

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

  const activeEnquiries = (user.activeEnquiries ?? []).map((enquiry) => updatedEnquiries[enquiry.id] ?? enquiry);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const sendEnquiryReply = async (enquiryId: number) => {
    const message = enquiryReplyDrafts[enquiryId]?.trim();
    if (!message) return;

    setEnquiryBusyId(enquiryId);
    setEnquiryError("");
    try {
      const response = await fetch(`/api/enquiries/${enquiryId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message }),
      });
      const payload = (await response.json()) as { error?: string; enquiry?: ActiveEnquiry };
      if (!response.ok || !payload.enquiry) {
        throw new Error(payload.error || "Failed to send reply");
      }

      setUpdatedEnquiries((current) => ({ ...current, [enquiryId]: payload.enquiry! }));
      setEnquiryReplyDrafts((current) => ({ ...current, [enquiryId]: "" }));
    } catch (replyError) {
      setEnquiryError(replyError instanceof Error ? replyError.message : "Failed to send reply");
    } finally {
      setEnquiryBusyId(null);
    }
  };

  const referralAchievement = achievementStatus?.currentAchievement ?? user.referralAchievement;
  const donationStats = user.donationStats ?? { totalAmount: 0, count: 0 };
  const currentTier = referralAchievement?.tier ?? null;
  const currentTierStyle = currentTier ? tierStyles[currentTier] : null;
  const statusInfo = getMembershipStatus(user.status, Boolean(user.certificateNumber));
  const isMembershipComplete = user.status === "active" && Boolean(user.certificateNumber);
  const baseUrl = typeof window === "undefined" ? "" : window.location.origin;
  const referralCode = encodeURIComponent(user.membershipId);
  const displayReferralCode = user.membershipId;
  const referralLink = `${baseUrl}/?ref=${referralCode}`;
  const copyReferralLink = async (type: "website" | "code") => {
    const text = type === "code" ? displayReferralCode : referralLink;
    await navigator.clipboard.writeText(text);
    setCopiedLink(type);
    window.setTimeout(() => setCopiedLink(null), 1800);
  };
  const membershipSteps = [
    { label: "Application submitted", detail: "Your details are saved.", icon: CheckCircle2 },
    { label: "Payment", detail: "Complete membership fee.", icon: CreditCard },
    { label: "Admin approval", detail: "Foundation team activation.", icon: Clock },
    { label: "Certificate", detail: "Issued after activation.", icon: Award },
  ];
  const profileInitials = user?.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "";
  const nextAchievement = achievementStatus?.tiers.find((tier) => !tier.unlocked) ?? null;
  const completedAchievementCount = achievementStatus?.tiers.filter((tier) => tier.unlocked).length ?? 0;
  const tierDisplayNames: Record<AchievementTier, string> = {
    silver: t("Silver", "सिल्वर"),
    gold: t("Gold", "गोल्ड"),
    platinum: t("Platinum", "प्लैटिनम"),
    diamond: t("Diamond", "डायमंड"),
  };
  const badgeLabel = (tier: AchievementTier) => `${tierDisplayNames[tier]} ${t("Badge", "बैज")}`;

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("Member workspace", "Member workspace")}</p>
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
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-bold shadow-inner overflow-hidden">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : profileInitials ? (
                  profileInitials
                ) : (
                  <User className="h-10 w-10" />
                )}
              </div>
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {currentTier && currentTierStyle && (
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase ${currentTierStyle.badge}`}>
                      <Medal className="mr-1.5 h-3.5 w-3.5" />
                      {badgeLabel(currentTier)}
                    </span>
                  )}
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
                    <p className="text-white/50">{t("Membership ID", "Membership ID")}</p>
                    <p data-testid="text-membership-id" className="font-mono font-bold text-white">{user.membershipId}</p>
                  </div>
                  <div>
                    <p className="text-white/50">{t("Member Type", "Member Type")}</p>
                    <p className="font-semibold text-white">{formatStatusLabel(user.membershipType)} {t("Member", "सदस्य")}</p>
                  </div>
                  <div>
                    <p className="text-white/50">{t("Joined On", "Joined On")}</p>
                    <p className="font-semibold text-white">{formatDate(user.joinedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={referralAchievement && currentTierStyle ? `rounded-xl border p-4 text-foreground ${currentTierStyle.panel}` : "hidden md:block"} aria-hidden={!referralAchievement}>
              {referralAchievement && currentTierStyle && (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground">{t("Profile Badge", "Profile Badge")}</p>
                      <h3 className="mt-1 text-lg font-bold">{badgeLabel(referralAchievement.tier)}</h3>
                    </div>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${currentTierStyle.mark}`}>
                      <Medal className="h-5 w-5" />
                    </span>
                  </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-muted-foreground">{t("Allotted certificate", "आवंटित प्रमाणपत्र")}</p>
                  <p className="break-all font-mono font-semibold text-foreground">{referralAchievement.certificateNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("Donation amount from your referrals", "आपके रेफरल से दान राशि")}: {formatMoney(referralAchievement.donationAmount)}
                  </p>
                </div>
                </>
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
                <h2 className="text-lg font-semibold">{t("Happy birthday", "जन्मदिन की शुभकामनाएं")}, {user.name}!</h2>
                <p className="mt-1 text-sm text-rose-900/80">
                  {t(
                    "Wishing you health, joy, and a meaningful year of service with Nisvarthjan Seva Foundation.",
                    "निस्वार्थजन सेवा फाउंडेशन के साथ आपको स्वास्थ्य, खुशी और सेवा के एक सार्थक वर्ष की शुभकामनाएं।"
                  )}
                </p>
                {birthdayEmailStatus === "sent" && (
                  <p className="mt-2 text-xs font-semibold text-rose-800">
                    {t("A birthday wish email has also been sent to you.", "आपको जन्मदिन की शुभकामना का एक ईमेल भी भेजा गया है।")}
                  </p>
                )}
                {birthdayEmailStatus === "alreadySent" && (
                  <p className="mt-2 text-xs font-semibold text-rose-800">
                    {t(
                      "Your birthday wish email was already sent for this year.",
                      "इस वर्ष के लिए आपका जन्मदिन की शुभकामना ईमेल पहले ही भेजा जा चुका है।"
                    )}
                  </p>
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
                      {isCurrent && step.label === "Payment" && user?.payment?.mode === "razorpay" && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            className="w-full text-xs py-1 h-8"
                            disabled={isPaying}
                            onClick={startRazorpayPayment}
                          >
                            {isPaying ? t("Opening Razorpay...", "Razorpay खुल रहा है...") : t("Pay with Razorpay", "Pay with Razorpay")}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {isMembershipComplete && (
          <>
            {activeEnquiries.length > 0 && (
              <section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase text-primary">{t("Active Enquiries", "Active Enquiries")}</p>
                  <h3 className="mt-1 text-xl font-bold text-foreground">{t("Your conversations with the foundation", "Your conversations with the foundation")}</h3>
                </div>
              </div>
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {activeEnquiries.length} {activeEnquiries.length === 1 ? t("open", "open") : t("open", "open")}
              </span>
            </div>

            {enquiryError && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{enquiryError}</p>}

            <div className="mt-5 space-y-4">
              {activeEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="rounded-xl border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t("Enquiry", "Enquiry")} #{enquiry.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(enquiry.updatedAt ?? enquiry.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${enquiryStatusClass(enquiry.status)}`}>
                      {formatStatusLabel(enquiry.status)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground">
                        <p className="whitespace-pre-wrap text-sm">{enquiry.message}</p>
                        <p className="mt-2 text-[11px] opacity-80">{t("You", "You")} | {formatDateTime(enquiry.createdAt)}</p>
                      </div>
                    </div>

                    {enquiry.replies.map((reply, index) => {
                      const isMine = reply.sentBy.toLowerCase() === user.email.toLowerCase();
                      return (
                        <div key={`${reply.sentAt}-${index}`} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                              isMine
                                ? "rounded-tr-sm bg-primary text-primary-foreground"
                                : "rounded-tl-sm border bg-card text-card-foreground"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm">{reply.message}</p>
                            <p className={`mt-2 text-[11px] ${isMine ? "opacity-80" : "text-muted-foreground"}`}>
                              {isMine ? t("You", "You") : t("Foundation Team", "Foundation Team")} | {formatDateTime(reply.sentAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <textarea
                      value={enquiryReplyDrafts[enquiry.id] ?? ""}
                      onChange={(event) => setEnquiryReplyDrafts((current) => ({ ...current, [enquiry.id]: event.target.value }))}
                      className="min-h-20 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder={t("Write a reply...", "Write a reply...")}
                    />
                    <Button
                      type="button"
                      className="sm:self-end"
                      disabled={enquiryBusyId === enquiry.id || !(enquiryReplyDrafts[enquiry.id] ?? "").trim()}
                      onClick={() => sendEnquiryReply(enquiry.id)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {enquiryBusyId === enquiry.id ? t("Sending", "Sending") : t("Send", "Send")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-foreground">{t("Personal Information", "Personal Information")}</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{t("Mobile", "Mobile")}</dt>
                <dd className="mt-1 font-medium text-foreground">{user.phone || t("Not available", "Not available")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("Date of Birth", "Date of Birth")}</dt>
                <dd className="mt-1 font-medium text-foreground">{formatDate(user.dateOfBirth)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("City", "City")}</dt>
                <dd className="mt-1 font-medium text-foreground">{user.city || t("Not available", "Not available")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("State", "State")}</dt>
                <dd className="mt-1 font-medium text-foreground">{user.state || t("Not available", "Not available")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">{t("Address", "Address")}</dt>
                <dd className="mt-1 font-medium text-foreground">{user.address || t("Not available", "Not available")}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">{t("Donation History", "Donation History")}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">{t("Donations", "दान")}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{donationStats.count}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">{t("Total Given", "कुल दान")}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{formatMoney(donationStats.totalAmount)}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Download your paid donation statement linked to your registered email.",
                "अपने पंजीकृत ईमेल से जुड़ा भुगतान किया गया दान विवरण डाउनलोड करें।",
              )}
            </p>
            <Button asChild variant="outline" className="mt-5 w-full">
              <a href="/api/donation-history/download">
                <Download className="mr-2 h-4 w-4" />
                {t("Download History PDF", "Download History PDF")}
              </a>
            </Button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {isMembershipComplete && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase text-primary">{t("Digital ID", "डिजिटल आईडी")}</p>
                  <h3 className="mt-1 text-xl font-bold text-foreground">{t("Membership ID Card", "सदस्यता आईडी कार्ड")}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t("Professional member identity card with QR verification.", "QR सत्यापन के साथ पेशेवर सदस्य पहचान पत्र।")}</p>
                </div>
                <Button asChild data-testid="button-download-id-card">
                  <a href="/api/membership-id-cards/download">
                    <Download className="mr-2 h-4 w-4" />
                    {t("Download ID Card", "आईडी कार्ड डाउनलोड करें")}
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
                    {t("Member Photo", "सदस्य फोटो")}
                  </div>
                  <div className="min-w-0">
                    <p className="break-words text-lg font-bold uppercase text-foreground">{user.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">{formatStatusLabel(user.membershipType)} {t("Member", "सदस्य")}</p>
                    <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">{t("Membership ID", "सदस्यता आईडी")}</dt>
                        <dd className="font-mono font-bold text-primary">{user.membershipId}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t("Certificate", "प्रमाणपत्र")}</dt>
                        <dd className="break-all font-mono font-bold text-primary">{user.certificateNumber}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 px-4 pb-4 text-center text-[10px] text-muted-foreground">
                  <div className="border-t pt-1">{t("Member Signature", "सदस्य हस्ताक्षर")}</div>
                  <div className="border-t pt-1">{t("Authority Signature", "प्राधिकृत हस्ताक्षर")}</div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-primary">{t("Download Center", "डाउनलोड केंद्र")}</p>
            <h3 className="mt-1 text-xl font-bold text-foreground">{t("Allotted Documents", "आवंटित दस्तावेज़")}</h3>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{t("Membership Certificate", "सदस्यता प्रमाणपत्र")}</p>
                    <p data-testid="text-certificate-number" className="mt-1 break-all font-mono text-sm font-bold text-primary">
                      {user.certificateNumber || t("Certificate pending", "प्रमाणपत्र लंबित")}
                    </p>
                  </div>
                  <Award className="h-5 w-5 text-primary" />
                </div>
                {user.status === "active" && user.certificateNumber && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild data-testid="button-download-cert" size="sm" variant="outline">
                      <a href="/api/certificates/download">
                        <Download className="mr-2 h-4 w-4" />
                        {t("Certificate", "प्रमाणपत्र")}
                      </a>
                    </Button>
                    <Button asChild data-testid="button-verify-cert" size="sm" variant="outline">
                      <a href={`/verify/${encodeURIComponent(user.certificateNumber)}`}>
                        <Shield className="mr-2 h-4 w-4" />
                        {t("Verify", "सत्यापित करें")}
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{t("Membership Receipt", "सदस्यता रसीद")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t("Fee receipt PDF with QR verification.", "QR सत्यापन के साथ शुल्क रसीद PDF।")}</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                {(user.status === "active" || user.status === "approval_pending") && (
                  <Button asChild data-testid="button-download-receipt" size="sm" variant="outline" className="mt-3">
                    <a href="/api/membership-receipts/download">
                      <Download className="mr-2 h-4 w-4" />
                      {t("Receipt", "रसीद")}
                    </a>
                  </Button>
                )}
              </div>

              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{t("Achievement Certificate", "उपलब्धि प्रमाणपत्र")}</p>
                    <p className="mt-1 break-all font-mono text-sm font-bold text-primary">
                      {referralAchievement?.certificateNumber || t("Not allotted yet", "अभी आवंटित नहीं")}
                    </p>
                  </div>
                  <Medal className="h-5 w-5 text-primary" />
                </div>
                {referralAchievement && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <a href="/api/referral-achievement/download">
                      <Download className="mr-2 h-4 w-4" />
                      {t("Achievement", "उपलब्धि")}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("Referral Link", "रेफरल लिंक")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Share this referral link. When someone opens it, your referral applies for that browser session only. Memberships, donations, and campaign donations completed in that session increase your badge progress.",
                  "यह रेफरल लिंक साझा करें। जब कोई इसे खोलेगा, तो आपका रेफरल केवल उस ब्राउज़र सत्र के लिए लागू होगा। उस सत्र में पूरी हुई सदस्यता, दान और अभियान दान आपकी बैज प्रगति बढ़ाते हैं।",
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border bg-background p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">{t("Website Referral", "वेबसाइट रेफरल")}</h4>
                </div>
                <p className="break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{referralLink}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("Referral code", "रेफरल कोड")}: <span className="font-mono font-semibold text-foreground">{displayReferralCode}</span>
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:w-80">
                <Button type="button" variant="outline" onClick={() => copyReferralLink("website")}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedLink === "website" ? t("Copied", "कॉपी हुआ") : t("Copy Link", "लिंक कॉपी करें")}
                </Button>
                <Button type="button" variant="outline" onClick={() => copyReferralLink("code")}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedLink === "code" ? t("Copied", "कॉपी हुआ") : t("Copy Code", "कोड कॉपी करें")}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Medal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("Achievements", "उपलब्धियां")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    "Your referrals unlock achievement badges. Complete the next targets to receive the next certificate.",
                    "आपके रेफरल उपलब्धि बैज खोलते हैं। अगला प्रमाणपत्र पाने के लिए अगले लक्ष्य पूरे करें।",
                  )}
                </p>
              </div>
            </div>
          </div>

          {achievementStatus ? (
            <div className="mt-6 space-y-5">
              <div className="overflow-x-auto pb-2">
                <div className="grid min-w-[680px] grid-cols-4 items-start gap-3">
                  {achievementStatus.tiers.map((tier, index) => {
                    const isCurrent = nextAchievement?.tier === tier.tier;
                    const isCompleted = tier.unlocked;
                    const style = tierStyles[tier.tier];

                    return (
                      <div key={tier.tier} className="relative flex flex-col items-center text-center">
                        {index > 0 && (
                          <div
                            className={`absolute right-1/2 top-6 h-0.5 w-full ${
                              index <= completedAchievementCount ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                        <span
                          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-1.5 shadow-sm ${
                            isCompleted
                              ? "border-primary"
                              : isCurrent
                                ? "border-primary"
                                : "border-border opacity-70 grayscale"
                          }`}
                        >
                          <Image src={tierBadgeImages[tier.tier]} alt={badgeLabel(tier.tier)} width={36} height={36} className="h-9 w-9 object-contain" />
                          <span
                            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${
                              isCompleted ? "bg-primary text-primary-foreground" : isCurrent ? style.mark : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : isCurrent ? <Medal className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          </span>
                        </span>
                        <p className={`mt-2 text-sm font-semibold ${isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {tierDisplayNames[tier.tier]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isCompleted ? t("Completed", "पूर्ण") : isCurrent ? t("Current target", "वर्तमान लक्ष्य") : t("Upcoming", "आगामी")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {nextAchievement ? (
                <div className={`rounded-xl border p-5 ${tierStyles[nextAchievement.tier].panel}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground">{t("Next achievement", "अगली उपलब्धि")}</p>
                      <h4 className="mt-1 text-xl font-bold text-foreground">{badgeLabel(nextAchievement.tier)}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{t("Complete these targets to unlock your next certificate.", "अपना अगला प्रमाणपत्र खोलने के लिए ये लक्ष्य पूरे करें।")}</p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-700">
                      <Lock className="h-3.5 w-3.5" />
                      {t("In progress", "प्रगति में")}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{t("Membership referrals", "सदस्यता रेफरल")}</span>
                        <span className="font-medium text-foreground">
                          {achievementStatus.stats.membershipReferralCount}/{nextAchievement.membershipReferralCount}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-rose-100 ring-1 ring-rose-200">
                        <div
                          className="h-full rounded-full bg-rose-700"
                          style={{
                            width: `${progressPercent(achievementStatus.stats.membershipReferralCount, nextAchievement.membershipReferralCount)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{t("Donation referrals", "दान रेफरल")}</span>
                        <span className="font-medium text-foreground">
                          {achievementStatus.stats.donationReferralCount}/{nextAchievement.donationReferralCount}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-amber-100 ring-1 ring-amber-200">
                        <div
                          className="h-full rounded-full bg-amber-600"
                          style={{
                            width: `${progressPercent(achievementStatus.stats.donationReferralCount, nextAchievement.donationReferralCount)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{t("Donation amount from referred donors", "रेफर किए गए दाताओं से दान राशि")}</span>
                        <span className="font-medium text-foreground">
                          {formatMoney(achievementStatus.stats.donationAmount)}/{formatMoney(nextAchievement.thresholdAmount)}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-emerald-100 ring-1 ring-emerald-200">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${progressPercent(achievementStatus.stats.donationAmount, nextAchievement.thresholdAmount)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="font-bold">{t("All badge achievements unlocked", "सभी बैज उपलब्धियां खुल गईं")}</h4>
                      <p className="mt-1 text-sm text-emerald-900/80">
                        {t(
                          "Your Silver, Gold, Platinum, and Diamond achievement certificates are complete.",
                          "आपके सिल्वर, गोल्ड, प्लैटिनम और डायमंड उपलब्धि प्रमाणपत्र पूरे हो गए हैं।",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">{t("Loading certificate progress...", "प्रमाणपत्र प्रगति लोड हो रही है...")}</p>
          )}
        </section>
          </>
        )}

      </div>
    </Layout>
  );
}
