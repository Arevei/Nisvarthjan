"use client";
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useRegisterMember } from "@/lib/api-client/api";
import type { Member } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Users, Award, Star, Download, QrCode, CreditCard, ArrowRight } from "lucide-react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

type Step = "form" | "payment" | "receipt";

interface RegistrationData {
  member: Member;
  fee: number;
  feeLabel: string;
}

const FEES: Record<string, { amount: number; label: string; labelHi: string }> = {
  general:  { amount: 500,  label: "₹500 / year",        labelHi: "₹500 / वर्ष" },
  active:   { amount: 1000, label: "₹1,000 / year",      labelHi: "₹1,000 / वर्ष" },
  lifetime: { amount: 5000, label: "₹5,000 (one-time)",  labelHi: "₹5,000 (एकमुश्त)" },
};

const UPI_ID = "nisvarthjan@upi";
const ORG_NAME = "Nisvarthjan Seva Foundation";

export default function Membership() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [regData, setRegData] = useState<RegistrationData | null>(null);
  const [paymentQr, setPaymentQr] = useState<string>("");
  const [receiptQr, setReceiptQr] = useState<string>("");
  const receiptRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", address: "", city: "", state: "", membershipType: "general",
  });

  const registerMember = useRegisterMember();

  const membershipTypes = [
    { value: "general",  label: t("General Member",  "सामान्य सदस्य"),  desc: t("Basic membership with voting rights", "मतदान अधिकार के साथ बुनियादी सदस्यता"), icon: Users  },
    { value: "active",   label: t("Active Member",   "सक्रिय सदस्य"),   desc: t("Full participation in campaigns",     "अभियानों में पूर्ण भागीदारी"),             icon: Star  },
    { value: "lifetime", label: t("Lifetime Member", "आजीवन सदस्य"),    desc: t("Lifelong membership with honours",    "सम्मान के साथ आजीवन सदस्यता"),           icon: Award },
  ];

  // Generate QR codes whenever regData changes
  useEffect(() => {
    if (!regData) return;
    const { member, fee } = regData;

    // UPI payment QR
    const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(ORG_NAME)}&am=${fee}&cu=INR&tn=${encodeURIComponent("Membership Fee - " + member.membershipId)}`;
    QRCode.toDataURL(upiString, { width: 220, margin: 2 }).then(setPaymentQr);

    // Receipt verification QR
    const receiptString = `${ORG_NAME}\nMember: ${member.name}\nID: ${member.membershipId}\nType: ${member.membershipType}\nEmail: ${member.email}`;
    QRCode.toDataURL(receiptString, { width: 180, margin: 2 }).then(setReceiptQr);
  }, [regData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast({ title: t("Please fill all required fields", "कृपया सभी आवश्यक फ़ील्ड भरें"), variant: "destructive" });
      return;
    }
    registerMember.mutate(
      { data: { name: form.name, email: form.email, phone: form.phone, password: form.password, address: form.address, city: form.city, state: form.state, membershipType: form.membershipType as "general" | "active" | "lifetime" } },
      {
        onSuccess: (member) => {
          const feeInfo = FEES[form.membershipType] ?? FEES.general;
          setRegData({ member, fee: feeInfo.amount, feeLabel: t(feeInfo.label, feeInfo.labelHi) });
          setStep("payment");
          toast({ title: t("Registration successful! Pay the fee to activate.", "पंजीकरण सफल! शुल्क दें।") });
        },
        onError: (err: any) => {
          const msg = err?.data?.error || t("Registration failed", "पंजीकरण विफल");
          toast({ title: msg, variant: "destructive" });
        },
      }
    );
  };

  const handlePaymentDone = () => {
    setStep("receipt");
    toast({ title: t("Payment confirmed! Your receipt is ready.", "भुगतान पुष्टि! रसीद तैयार है।") });
  };

  const handleDownloadPDF = () => {
    if (!regData) return;
    const { member } = regData;
    const doc = new jsPDF({ unit: "mm", format: "a5" });

    const primary = [177, 18, 38] as [number, number, number];
    const light   = [254, 242, 242] as [number, number, number];

    // Header band
    doc.setFillColor(...primary);
    doc.rect(0, 0, 148, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(ORG_NAME, 74, 11, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Membership Receipt", 74, 18, { align: "center" });
    doc.text("निस्वार्थजन सेवा फाउंडेशन — सदस्यता रसीद", 74, 24, { align: "center" });

    // Receipt number badge
    doc.setFillColor(...light);
    doc.roundedRect(10, 32, 128, 10, 2, 2, "F");
    doc.setTextColor(...primary);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Membership ID: ${member.membershipId}`, 74, 39, { align: "center" });

    // Details table
    const rows: [string, string][] = [
      [t("Name", "नाम"),                  member.name],
      [t("Email", "ईमेल"),                member.email],
      [t("Phone", "फोन"),                 member.phone],
      [t("Membership Type", "सदस्यता"),   member.membershipType.toUpperCase()],
      [t("Fee Paid", "शुल्क"),            regData.feeLabel],
      [t("Status", "स्थिति"),             member.status.toUpperCase()],
      [t("Joined", "शामिल हुए"),          new Date(member.joinedAt).toLocaleDateString("en-IN")],
    ];

    let y = 48;
    rows.forEach(([key, val], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(10, y, 128, 8, "F");
      }
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(key, 14, y + 5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(val, 74, y + 5.5);
      y += 8;
    });

    // QR code on the right if available
    if (receiptQr) {
      doc.addImage(receiptQr, "PNG", 100, 118, 38, 38);
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text("Scan to verify", 119, 158, { align: "center" });
    }

    // Footer
    doc.setFillColor(...primary);
    doc.rect(0, 196, 148, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text("This is a computer-generated receipt. No signature required.", 74, 199, { align: "center" });

    doc.save(`NSF-Receipt-${member.membershipId}.pdf`);
    toast({ title: t("PDF downloaded!", "PDF डाउनलोड हो गई!") });
  };

  /* ─────────── STEP: FORM ─────────── */
  if (step === "form") {
    return (
      <Layout>
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-4xl font-serif font-bold mb-3">{t("Become a Member", "सदस्य बनें")}</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              {t("Join thousands of changemakers building a better India.", "बेहतर भारत के निर्माण के लिए हजारों परिवर्तनकारियों से जुड़ें।")}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Membership type cards */}
          <div className="grid lg:grid-cols-3 gap-4 mb-10">
            {membershipTypes.map(({ value, label, desc, icon: Icon }) => {
              const fee = FEES[value];
              return (
                <button
                  key={value}
                  data-testid={`button-membership-${value}`}
                  onClick={() => setForm((f) => ({ ...f, membershipType: value }))}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${form.membershipType === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${form.membershipType === value ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-semibold text-foreground mb-1">{label}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                  <div className={`text-sm font-bold ${form.membershipType === value ? "text-primary" : "text-muted-foreground"}`}>
                    {t(fee.label, fee.labelHi)}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6">{t("Registration Form", "पंजीकरण फ़ॉर्म")}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">{t("Full Name *", "पूरा नाम *")}</Label>
                <Input data-testid="input-name" id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="email">{t("Email Address *", "ईमेल पता *")}</Label>
                <Input data-testid="input-email" id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="phone">{t("Mobile Number *", "मोबाइल नंबर *")}</Label>
                <Input data-testid="input-phone" id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="password">{t("Password *", "पासवर्ड *")}</Label>
                <Input
                  data-testid="input-password"
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">{t("Address", "पता")}</Label>
                <Input data-testid="input-address" id="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="city">{t("City", "शहर")}</Label>
                <Input data-testid="input-city" id="city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="state">{t("State", "राज्य")}</Label>
                <Select value={form.state} onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}>
                  <SelectTrigger data-testid="select-state"><SelectValue placeholder={t("Select state", "राज्य चुनें")} /></SelectTrigger>
                  <SelectContent>
                    {["Uttar Pradesh", "Madhya Pradesh", "Bihar", "Rajasthan", "Maharashtra", "Gujarat", "Delhi", "West Bengal", "Other"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Button data-testid="button-submit-membership" type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6" disabled={registerMember.isPending}>
                  {registerMember.isPending ? t("Registering...", "पंजीकरण हो रहा है...") : <>{t("Register & Pay", "पंजीकरण करें और भुगतान करें")} <ArrowRight className="w-5 h-5 ml-2" /></>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  /* ─────────── STEP: PAYMENT ─────────── */
  if (step === "payment" && regData) {
    const { member } = regData;
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-2">{t("Pay Membership Fee", "सदस्यता शुल्क भुगतान करें")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("Scan the QR code below using any UPI app to complete your payment.", "नीचे दिए QR कोड को किसी भी UPI ऐप से स्कैन करें।")}
            </p>
          </div>

          <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 shadow-sm">
            <div className="bg-primary/5 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{t("Member", "सदस्य")}</span>
                <span className="font-semibold">{member.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{t("Membership ID", "सदस्यता ID")}</span>
                <span className="font-mono text-xs text-primary">{member.membershipId}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{t("Type", "प्रकार")}</span>
                <span className="capitalize font-medium">{member.membershipType}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="font-bold text-foreground">{t("Amount Due", "देय राशि")}</span>
                <span className="font-bold text-primary text-lg">{regData.feeLabel}</span>
              </div>
            </div>

            {paymentQr ? (
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="p-3 bg-white rounded-xl border shadow-sm">
                  <img src={paymentQr} alt="UPI QR Code" className="w-48 h-48" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {t(`UPI ID: ${UPI_ID}`, `UPI आईडी: ${UPI_ID}`)}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <QrCode className="w-3.5 h-3.5" />
                  {t("Works with PhonePe, GPay, Paytm, BHIM & all UPI apps", "PhonePe, GPay, Paytm, BHIM और सभी UPI ऐप्स से काम करता है")}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            )}

            <Button onClick={handlePaymentDone} className="w-full bg-primary hover:bg-primary/90 py-6 text-base">
              <CheckCircle className="w-5 h-5 mr-2" />
              {t("I have completed the payment", "मैंने भुगतान कर दिया है")}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              {t("Your membership will be activated after payment verification.", "भुगतान सत्यापन के बाद आपकी सदस्यता सक्रिय होगी।")}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ─────────── STEP: RECEIPT ─────────── */
  if (step === "receipt" && regData) {
    const { member } = regData;
    const joinDate = new Date(member.joinedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center mb-6">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h1 className="text-2xl font-serif font-bold text-foreground">{t("Membership Receipt", "सदस्यता रसीद")}</h1>
            <p className="text-muted-foreground text-sm">{t("Welcome to Nisvarthjan Seva Foundation!", "निस्वार्थजन सेवा फाउंडेशन में आपका स्वागत है!")}</p>
          </div>

          {/* Receipt card — printed look */}
          <div ref={receiptRef} className="bg-white border-2 border-primary/30 rounded-2xl shadow-lg overflow-hidden print:shadow-none">
            {/* Header */}
            <div className="bg-primary text-primary-foreground text-center py-6 px-6">
              <h2 className="text-xl font-bold font-serif">{ORG_NAME}</h2>
              <p className="text-sm opacity-80">निस्वार्थजन सेवा फाउंडेशन</p>
              <p className="text-xs opacity-60 mt-1">"मानव सेवा ही सर्वोच्च सेवा है"</p>
            </div>

            {/* Receipt ID band */}
            <div className="bg-primary/10 px-6 py-3 text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("Membership ID", "सदस्यता आईडी")}</span>
              <div className="font-mono font-bold text-primary text-lg">{member.membershipId}</div>
            </div>

            <div className="p-6">
              <div className="flex gap-6">
                {/* Details */}
                <div className="flex-1 space-y-3">
                  {[
                    [t("Full Name", "पूरा नाम"),            member.name],
                    [t("Email",     "ईमेल"),                member.email],
                    [t("Phone",     "फोन"),                 member.phone],
                    [t("City",      "शहर"),                 member.city || "—"],
                    [t("Type",      "सदस्यता प्रकार"),      member.membershipType.charAt(0).toUpperCase() + member.membershipType.slice(1)],
                    [t("Fee Paid",  "शुल्क भुगतान"),        regData.feeLabel],
                    [t("Date",      "तारीख"),               joinDate],
                    [t("Status",    "स्थिति"),              member.status.charAt(0).toUpperCase() + member.status.slice(1)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start gap-2 text-sm border-b border-border/50 pb-2">
                      <span className="text-muted-foreground w-36 flex-shrink-0 font-medium">{k}</span>
                      <span className="text-foreground font-medium break-all">{v}</span>
                    </div>
                  ))}
                </div>

                {/* QR Code */}
                {receiptQr && (
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="p-2 bg-white border rounded-lg shadow-sm">
                      <img src={receiptQr} alt="Membership QR" className="w-28 h-28" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{t("Scan to verify", "स्कैन करें")}</p>
                  </div>
                )}
              </div>

              {member.certificateNumber && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-green-700 font-medium">{t("Certificate Number:", "प्रमाणपत्र संख्या:")}</p>
                  <p className="font-mono font-bold text-green-800">{member.certificateNumber}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-muted/30 border-t px-6 py-3 text-center">
              <p className="text-xs text-muted-foreground">{t("This is a computer-generated receipt. No signature required.", "यह एक कंप्यूटर-जनित रसीद है। हस्ताक्षर की आवश्यकता नहीं है।")}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button onClick={handleDownloadPDF} className="flex-1 bg-primary hover:bg-primary/90 gap-2 py-6">
              <Download className="w-5 h-5" />
              {t("Download PDF Receipt", "PDF रसीद डाउनलोड करें")}
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1 gap-2 py-6">
              {t("Print Receipt", "रसीद प्रिंट करें")}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {t("A receipt has been sent to", "रसीद भेजी गई है")} <strong>{member.email}</strong>
          </p>
        </div>
      </Layout>
    );
  }

  return null;
}




