"use client";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useCreateDonation } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle } from "lucide-react";
import Image from "next/image";
import { loadRazorpayScript, type RazorpaySuccess } from "@/lib/razorpay-client";
import { captureReferralCodeFromUrl } from "@/lib/referral-code";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];
const DONATION_QR_IMAGE = "/QR-image.png";
const MIN_DONATION_AMOUNT = 100;

export default function Donate() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorPan, setDonorPan] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [receiptContact, setReceiptContact] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const createDonation = useCreateDonation();

  useEffect(() => {
    window.setTimeout(() => setReferralCode(captureReferralCodeFromUrl()), 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    window.setTimeout(() => {
      setDonorName(user.name);
      setDonorEmail(user.email);
      setDonorPhone(user.phone || "");
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
      setReceipt(donation.receiptNumber);
      setReceiptContact(donation.donorEmail);
      toast({ title: t("Donation recorded! Thank you.", "दान दर्ज किया गया! धन्यवाद।") });
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
        contact: donation.donorPhone || "",
      },
      notes: {
        donationId: String(donation.id),
        receiptNumber: donation.receiptNumber,
        purpose: donation.purpose,
      },
      theme: { color: "#be0027" },
      handler: async (response: RazorpaySuccess) => {
        try {
          await verifyDonationPayment(donation.id, response);
          setReceipt(donation.receiptNumber);
          setReceiptContact(donation.donorEmail);
          toast({ title: t("Donation payment confirmed. Thank you.", "दान भुगतान की पुष्टि हुई। धन्यवाद।") });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(customAmount || amount);
    if (!finalAmount || finalAmount < MIN_DONATION_AMOUNT) {
      toast({ title: t("Minimum donation amount is Rs 100", "न्यूनतम दान राशि Rs 100 है"), variant: "destructive" });
      return;
    }
    if (finalAmount <= 0) {
      toast({ title: t("Please select or enter an amount", "कृपया राशि चुनें या दर्ज करें"), variant: "destructive" });
      return;
    }
    if ((!user && (!donorName || !donorEmail)) || !purpose) {
      toast({ title: t("Please fill all required fields", "कृपया सभी आवश्यक फ़ील्ड भरें"), variant: "destructive" });
      return;
    }

    createDonation.mutate(
      { data: { amount: finalAmount, donorName, donorEmail, donorPhone, donorPan, donorAddress, purpose, referralCode: referralCode || undefined } },
      {
        onSuccess: (donation) => startRazorpayPayment(donation),
        onError: () => {
          toast({ title: t("Failed to record donation", "दान दर्ज करने में विफल"), variant: "destructive" });
        },
      }
    );
  };

  if (receipt) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 max-w-lg text-center">
          <div className="bg-card rounded-2xl p-10 shadow-lg border">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">{t("Donation Successful!", "दान सफल!")}</h2>
            <p className="text-muted-foreground mb-4">{t("Your receipt number:", "आपकी रसीद संख्या:")}</p>
            <div className="bg-primary/10 text-primary font-mono text-lg font-bold py-3 px-6 rounded-lg mb-6">{receipt}</div>
            <p className="text-sm text-muted-foreground mb-6">{t("A QR-coded 80G receipt PDF has been sent to your email.", "एक QR-कोड वाली 80G रसीद PDF आपके ईमेल पर भेज दी गई है।")}</p>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <a href={`/api/donation-receipts/download?receiptNumber=${encodeURIComponent(receipt)}&contact=${encodeURIComponent(receiptContact)}`}>
                  {t("Download Receipt", "Download Receipt")}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`/verify?certificateNumber=${encodeURIComponent(receipt)}&documentType=donation-receipt`}>
                  {t("Verify Receipt", "Verify Receipt")}
                </a>
              </Button>
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => { setReceipt(null); setReceiptContact(""); setAmount(""); setCustomAmount(""); setDonorName(user?.name || ""); setDonorEmail(user?.email || ""); setDonorPhone(user?.phone || ""); setDonorPan(""); setDonorAddress(""); setPurpose(""); }}>
              {t("Donate Again", "फिर से दान करें")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 fill-current" />
          <h1 className="text-4xl font-serif font-bold mb-3">{t("Your Donation Changes Lives", "आपका दान जीवन बदलता है")}</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            {t("Every rupee you donate goes directly to education, health, and community welfare programs.", "आपके द्वारा दिया गया प्रत्येक रुपया सीधे शिक्षा, स्वास्थ्य और सामुदायिक कल्याण कार्यक्रमों में जाता है।")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">{t("Make a Donation", "दान करें")}</h2>
            {referralCode && (
              <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                {t("Member referral applied","सदस्य रेफ़रल लागू किया गया")}: <span className="font-semibold">{referralCode}</span>
              </div>
            )}

            <div className="mb-6">
              <Label className="text-sm font-medium text-foreground mb-3 block">{t("Select Amount (₹)", "राशि चुनें (₹)")}</Label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    data-testid={`button-amount-${amt}`}
                    onClick={() => { setAmount(String(amt)); setCustomAmount(String(amt)); }}
                    className={`py-3 rounded-lg border-2 font-semibold transition-all ${amount === String(amt) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary text-foreground"}`}
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <Input
                data-testid="input-custom-amount"
                type="number"
                min={MIN_DONATION_AMOUNT}
                placeholder={t("Or enter custom amount", "या कस्टम राशि दर्ज करें")}
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(e.target.value); }}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (e.target.value && value < MIN_DONATION_AMOUNT) {
                    setCustomAmount(String(MIN_DONATION_AMOUNT));
                    setAmount(String(MIN_DONATION_AMOUNT));
                  }
                }}
                className="mt-2"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {user ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                  {t("Donating as", "दानकर्ता")}: <span className="font-semibold">{user.name}</span> ({user.email})
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="name">{t("Full Name *", "पूरा नाम *")}</Label>
                    <Input data-testid="input-name" id="name" value={donorName} onChange={(e) => setDonorName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("Email *", "ईमेल *")}</Label>
                    <Input data-testid="input-email" id="email" type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("Mobile Number", "मोबाइल नंबर")}</Label>
                    <Input data-testid="input-phone" id="phone" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="pan">{t("PAN Number for 80G", "80G के लिए पैन (PAN) नंबर")}</Label>
                <Input
                  data-testid="input-pan"
                  id="pan"
                  value={donorPan}
                  onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <Label htmlFor="address">{t("Address for 80G Receipt", "80G रसीद के लिए पता")}</Label>
                <Input data-testid="input-address" id="address" value={donorAddress} onChange={(e) => setDonorAddress(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="purpose">{t("Donation Purpose *", "दान का उद्देश्य *")}</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger data-testid="select-purpose">
                    <SelectValue placeholder={t("Select purpose", "उद्देश्य चुनें")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Education Support">{t("Education Support", "शिक्षा सहायता")}</SelectItem>
                    <SelectItem value="Health Services">{t("Health Services", "स्वास्थ्य सेवा")}</SelectItem>
                    <SelectItem value="Poor & Needy Support">{t("Poor & Needy Support", "गरीब एवं जरूरतमंद सहायता")}</SelectItem>
                    <SelectItem value="Environment Campaign">{t("Environment Campaign", "पर्यावरण अभियान")}</SelectItem>
                    <SelectItem value="Disaster Relief">{t("Disaster Relief", "आपदा राहत कार्य")}</SelectItem>
                    <SelectItem value="General Donation">{t("General Donation", "सामान्य दान")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                data-testid="button-donate-submit"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                disabled={createDonation.isPending || isPaying}
              >
                {createDonation.isPending || isPaying ? t("Processing...", "प्रसंस्करण...") : t("Donate Now", "अभी दान करें")}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-8 text-center shadow-sm">
              <Image
                src={DONATION_QR_IMAGE}
                alt={t("Donation payment QR code", "दान भुगतान QR कोड")}
                width={443}
                height={650}
                className="mx-auto h-auto w-full max-w-sm rounded-lg border bg-white"
                priority
              />
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{t("Direct QR payment note", "सीधे QR भुगतान के लिए नोट")}</p>
                <p className="mt-2">
                  {t(
                    "If you want to donate directly, scan this QR code and complete the payment. After payment, email the payment screenshot or transaction details to",
                    "यदि आप सीधे दान करना चाहते हैं, तो इस QR कोड को स्कैन करके भुगतान पूरा करें। भुगतान के बाद पेमेंट स्क्रीनशॉट या ट्रांजैक्शन विवरण इस ईमेल पर भेजें",
                  )}{" "}
                  <a className="font-semibold text-primary underline-offset-4 hover:underline" href="mailto:nisvarthjansevango@gmail.com">
                    nisvarthjansevango@gmail.com
                  </a>
                  {t(" so the team can verify your donation and issue the receipt.", " ताकि टीम आपका दान सत्यापित करके रसीद जारी कर सके।")}
                </p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-3">{t("Your donation helps:", "आपका दान इसमें मदद करता है:")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  [t("Education of underprivileged children", "वंचित बच्चों की शिक्षा"), "📚"],
                  [t("Free health camps in villages", "गांवों में निःशुल्क स्वास्थ्य शिविर"), "🏥"],
                  [t("Women empowerment programs", "महिला सशक्तिकरण कार्यक्रम"), "💪"],
                  [t("Tree plantation and environment", "वृक्षारोपण और पर्यावरण"), "🌱"],
                  [t("Disaster relief and rehabilitation", "आपदा राहत और पुनर्वास"), "🤝"],
                ].map(([text, icon]) => (
                  <li key={text} className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


