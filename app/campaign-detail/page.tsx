"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useGetCampaign, getGetCampaignQueryKey, useCreateDonation } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Target, Heart } from "lucide-react";
import { loadRazorpayScript, type RazorpaySuccess } from "@/lib/razorpay-client";
import { captureReferralCodeFromUrl } from "@/lib/referral-code";

const MIN_DONATION_AMOUNT = 100;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const toRenderableHtml = (value: string) => {
  if (/<[a-z][\s\S]*>/i.test(value)) return value;

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
};

export default function CampaignDetail() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const id = parseInt(params?.id ?? "0");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const { data: campaign, isLoading } = useGetCampaign(id, {
    query: { enabled: !!id, queryKey: getGetCampaignQueryKey(id) },
  });

  const createDonation = useCreateDonation();

  useEffect(() => {
    window.setTimeout(() => setReferralCode(captureReferralCodeFromUrl()), 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    window.setTimeout(() => {
      setDonorName(user.name);
      setDonorEmail(user.email);
    }, 0);
  }, [user]);

  const verifyDonationPayment = async (donationId: number, response: RazorpaySuccess) => {
    const verifyResponse = await fetch("/api/donation-payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        donationId,
        ...response,
      }),
    });

    const payload = await verifyResponse.json();
    if (!verifyResponse.ok) {
      throw new Error(payload.error || "Payment verification failed");
    }

    return payload;
  };

  const startRazorpayPayment = async (donation: NonNullable<typeof createDonation.data>) => {
    if (!donation.payment) {
      toast({ title: t("Thank you for your support!", "आपके सहयोग के लिए धन्यवाद!") });
      await queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(id) });
      return;
    }

    setIsPaying(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setIsPaying(false);
      toast({ title: "Unable to load Razorpay checkout", variant: "destructive" });
      return;
    }

    const checkout = new window.Razorpay({
      key: donation.payment.keyId,
      amount: donation.payment.amount * 100,
      currency: donation.payment.currency,
      name: "Nisvarthjan Seva Foundation",
      description: donation.purpose,
      order_id: donation.payment.orderId,
      prefill: {
        name: donation.donorName,
        email: donation.donorEmail,
      },
      notes: {
        donationId: String(donation.id),
        receiptNumber: donation.receiptNumber,
        campaignId: donation.campaignId ? String(donation.campaignId) : "",
      },
      theme: { color: "#be0027" },
      handler: async (response: RazorpaySuccess) => {
        try {
          await verifyDonationPayment(donation.id, response);
          await queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(id) });
          toast({ title: t("Payment confirmed. Thank you for your support!", "भुगतान की पुष्टि हुई। आपके सहयोग के लिए धन्यवाद!") });
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

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount < MIN_DONATION_AMOUNT) {
      toast({ title: t("Minimum donation amount is Rs 100", "न्यूनतम दान राशि Rs 100 है"), variant: "destructive" });
      return;
    }
    if (!amount || (!user && (!donorName || !donorEmail))) {
      toast({ title: t("Please fill all fields", "कृपया सभी फ़ील्ड भरें"), variant: "destructive" });
      return;
    }
    createDonation.mutate(
      {
        data: {
          amount: donationAmount,
          donorName,
          donorEmail,
          campaignId: id,
          purpose: campaign?.title ?? "Campaign donation",
          referralCode: referralCode || undefined,
        },
      },
      {
        onSuccess: (donation) => startRazorpayPayment(donation),
        onError: () => toast({ title: t("Donation failed", "दान विफल"), variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return <Layout><div className="container mx-auto px-4 py-16"><div className="animate-pulse space-y-4 max-w-2xl mx-auto"><div className="h-64 bg-muted rounded-xl" /><div className="h-8 bg-muted rounded w-3/4" /></div></div></Layout>;
  }

  if (!campaign) {
    return <Layout><div className="container mx-auto px-4 py-16 text-center"><h1 className="text-2xl font-bold">{t("Campaign not found", "अभियान नहीं मिला")}</h1><Button asChild className="mt-4"><Link href="/campaigns">{t("All Campaigns", "सभी अभियान")}</Link></Button></div></Layout>;
  }

  const pct = Math.min(100, (campaign.raisedAmount / campaign.goalAmount) * 100);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6 text-primary">
          <Link href="/campaigns"><ArrowLeft className="w-4 h-4 mr-2" />{t("All Campaigns", "सभी अभियान")}</Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            {campaign.imageUrl ? (
              <img src={campaign.imageUrl} alt={t(campaign.title, campaign.titleHindi)} className="w-full h-72 object-cover rounded-2xl mb-6" />
            ) : (
              <div className="w-full h-72 bg-primary/10 rounded-2xl mb-6 flex items-center justify-center">
                <Heart className="w-16 h-16 text-primary/40" />
              </div>
            )}

            <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mb-3 capitalize">{campaign.category}</div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-4">{t(campaign.title, campaign.titleHindi)}</h1>
            <div
              className="prose prose-sm mb-6 max-w-none text-foreground prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: toRenderableHtml(t(campaign.description, campaign.descriptionHindi)) }}
            />

            <div className="bg-card border rounded-xl p-6 space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{t("Raised", "एकत्रित")}</span>
                <span className="text-foreground">₹{campaign.raisedAmount.toLocaleString("en-IN")} / ₹{campaign.goalAmount.toLocaleString("en-IN")}</span>
              </div>
              <Progress value={pct} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Target className="w-4 h-4" />{Math.round(pct)}% {t("funded", "वित्त पोषित")}</div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" />{campaign.donorCount} {t("donors", "दानकर्ता")}</div>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-8 shadow-sm h-fit">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6">{t("Support This Campaign", "इस अभियान का समर्थन करें")}</h2>
            {referralCode && (
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                Member referral applied: <span className="font-semibold">{referralCode}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[500, 1000, 2500].map((a) => (
                <button key={a} data-testid={`button-amount-${a}`} onClick={() => setAmount(String(a))} className={`py-2 rounded-lg border-2 font-semibold text-sm transition-all ${amount === String(a) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary text-foreground"}`}>
                  ₹{a.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <Input
                  data-testid="input-amount"
                  type="number"
                  min={MIN_DONATION_AMOUNT}
                  placeholder={t("Enter amount (₹)", "राशि दर्ज करें (₹)")}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (e.target.value && value < MIN_DONATION_AMOUNT) {
                      setAmount(String(MIN_DONATION_AMOUNT));
                    }
                  }}
                />
              </div>
              {user ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                  {t("Donating as", "दानकर्ता")}: <span className="font-semibold">{user.name}</span> ({user.email})
                </div>
              ) : (
                <>
                  <div>
                    <Input data-testid="input-name" placeholder={t("Your Name *", "आपका नाम *")} value={donorName} onChange={(e) => setDonorName(e.target.value)} required />
                  </div>
                  <div>
                    <Input data-testid="input-email" type="email" placeholder={t("Email Address *", "ईमेल पता *")} value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required />
                  </div>
                </>
              )}
              <Button data-testid="button-donate" type="submit" className="w-full bg-primary hover:bg-primary/90 py-6 text-lg" disabled={createDonation.isPending || isPaying}>
                <Heart className="w-5 h-5 mr-2 fill-current" />
                {createDonation.isPending || isPaying ? t("Processing...", "प्रसंस्करण...") : t("Donate Now", "अभी दान करें")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}






