"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { User, Award, Calendar, LogOut, Shield, Download, CheckCircle2, Clock, CreditCard, AlertCircle } from "lucide-react";

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
        : "Your membership is active. The certificate will appear here after it is issued by the admin.",
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
    description: "Your membership request has been submitted. Admin approval is the next step.",
    tone: "border-blue-200 bg-blue-50 text-blue-950",
    badge: "bg-blue-100 text-blue-800",
    completedSteps: 1,
    currentStep: 2,
  };
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

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
  const membershipSteps = [
    {
      label: "Application submitted",
      detail: "Your details are saved.",
      icon: CheckCircle2,
    },
    {
      label: "Admin approval",
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
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">{t("Member Dashboard", "सदस्य डैशबोर्ड")}</h1>
          <Button data-testid="button-logout" variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> {t("Logout", "लॉगआउट")}
          </Button>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 data-testid="text-member-name" className="text-2xl font-serif font-bold mb-1">{user.name}</h2>
              <p data-testid="text-member-email" className="text-primary-foreground/80 mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">{user.membershipType}</span>
                <span data-testid="status-membership" className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{user.status}</span>
              </div>
            </div>
          </div>
        </div>

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





