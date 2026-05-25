"use client";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useCreateDonation } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, QrCode, CheckCircle } from "lucide-react";
import { loadRazorpayScript, type RazorpaySuccess } from "@/lib/razorpay-client";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];
const MIN_DONATION_AMOUNT = 100;

export default function Donate() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const createDonation = useCreateDonation();

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
    if (!donorName || !donorEmail || !purpose) {
      toast({ title: t("Please fill all required fields", "कृपया सभी आवश्यक फ़ील्ड भरें"), variant: "destructive" });
      return;
    }

    createDonation.mutate(
      { data: { amount: finalAmount, donorName, donorEmail, donorPhone, purpose } },
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
            <p className="text-sm text-muted-foreground mb-6">{t("Please save this receipt number for your records.", "कृपया इस रसीद संख्या को अपने रिकॉर्ड के लिए सुरक्षित रखें।")}</p>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => { setReceipt(null); setAmount(""); setCustomAmount(""); setDonorName(""); setDonorEmail(""); setDonorPhone(""); setPurpose(""); }}>
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
              <QrCode className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("Pay via UPI", "UPI से भुगतान करें")}</h3>
              <div className="w-48 h-48 bg-muted border-2 border-dashed border-border rounded-xl mx-auto flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{t("UPI QR Code", "UPI QR कोड")}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{t("Scan to donate via UPI", "UPI से दान करने के लिए स्कैन करें")}</p>
              <p className="font-semibold text-foreground mt-2">nsf@upi</p>
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




