"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock3, CreditCard, Mail, Users } from "lucide-react";
import { captureReferralCodeFromUrl } from "@/lib/referral-code";
import { MemberPhotoUpload } from "@/components/home/member-photo-upload";

type Step = "form" | "manual-submitted" | "razorpay-ready" | "paid";
type MembershipType = "general" | "active" | "lifetime";

type MemberResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  membershipId: string;
  status: string;
};

type RegisterResponse = {
  member: MemberResponse;
  paymentMode: "manual" | "razorpay";
  payment?: {
    provider: "razorpay";
    keyId: string;
    orderId: string;
    amount: number;
    currency: "INR";
  };
  error?: string;
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}

const membershipFees: Record<MembershipType, number> = {
  general: 500,
  active: 1100,
  lifetime: 5100,
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Membership() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [registration, setRegistration] = useState<RegisterResponse | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    address: "",
    city: "",
    state: "",
    membershipType: "general" as MembershipType,
    photo: "",
    education: "",
    donationPurpose: "",
  });

  const selectedFee = membershipFees[form.membershipType];

  useEffect(() => {
    window.setTimeout(() => setReferralCode(captureReferralCodeFromUrl()), 0);
  }, []);

  const verifyPayment = async (response: RazorpaySuccess, memberId: number) => {
    const verifyResponse = await fetch("/api/membership-payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        memberId,
        ...response,
      }),
    });

    const payload = await verifyResponse.json();
    if (!verifyResponse.ok) {
      throw new Error(payload.error || "Payment verification failed");
    }

    return payload;
  };

  const startRazorpayPayment = async (payload: RegisterResponse) => {
    if (!payload.payment) return;

    setIsPaying(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setIsPaying(false);
      toast({ title: "Unable to load Razorpay checkout", variant: "destructive" });
      return;
    }

    const checkout = new window.Razorpay({
      key: payload.payment.keyId,
      amount: payload.payment.amount * 100,
      currency: payload.payment.currency,
      name: "Nisvarthjan Seva Foundation",
      description: `${payload.member.membershipType} membership fee`,
      order_id: payload.payment.orderId,
      prefill: {
        name: payload.member.name,
        email: payload.member.email,
        contact: payload.member.phone,
      },
      notes: {
        memberId: String(payload.member.id),
        membershipId: payload.member.membershipId,
      },
      theme: { color: "#be0027" },
      handler: async (response: RazorpaySuccess) => {
        try {
          await verifyPayment(response, payload.member.id);
          setStep("paid");
          toast({ title: "Payment confirmed. Admin approval is pending." });
          router.push("/dashboard");
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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth || undefined,
          password: form.password,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          membershipType: form.membershipType,
          referralCode: referralCode || undefined,
          photo: form.photo || undefined,
          education: form.education || undefined,
          donationPurpose: form.donationPurpose || undefined,
        }),
      });

      const payload = (await response.json()) as RegisterResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Registration failed");
      }

      setSubmittedEmail(form.email);
      setRegistration(payload);

      if (payload.paymentMode === "razorpay" && payload.payment) {
        setStep("razorpay-ready");
        toast({ title: "Membership request created. Complete payment to continue." });
        await startRazorpayPayment(payload);
      } else {
        setStep("manual-submitted");
        toast({ title: "Membership request submitted successfully" });
      }
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "manual-submitted") {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-xl border border-emerald-200 bg-white p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-center text-2xl font-serif font-bold">{t("Request Submitted", "Request Submitted")}</h1>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
              {t("Your membership application is now in the foundation review queue.", "आपका सदस्यता आवेदन अब समीक्षा में है।")}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                <Clock3 className="mx-auto h-5 w-5 text-amber-600" />
                <p className="mt-2 text-xs font-semibold uppercase text-zinc-500">Step 1</p>
                <p className="text-sm">{t("Foundation verification", "फाउंडेशन सत्यापन")}</p>
              </div>
              <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                <Mail className="mx-auto h-5 w-5 text-blue-600" />
                <p className="mt-2 text-xs font-semibold uppercase text-zinc-500">Step 2</p>
                <p className="text-sm">{t("Payment QR sent on email", "भुगतान QR ईमेल पर भेजा जाएगा")}</p>
              </div>
              <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                <Users className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-2 text-xs font-semibold uppercase text-zinc-500">Step 3</p>
                <p className="text-sm">{t("Manual activation by team", "टीम द्वारा मैनुअल सक्रियण")}</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
              <p className="font-medium">{t("Registered Email:", "पंजीकृत ईमेल:")}</p>
              <p className="text-muted-foreground">{submittedEmail}</p>
              <p className="mt-3 text-muted-foreground">
                {t(
                  "Please watch this inbox. After approval, payment details and QR image will be sent by the foundation team.",
                  "कृपया इस इनबॉक्स पर ध्यान दें। स्वीकृति के बाद भुगतान विवरण और QR इमेज फाउंडेशन टीम द्वारा भेजी जाएगी।",
                )}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (step === "razorpay-ready" && registration?.payment) {
    return (
      <Layout>
        <div className="container mx-auto max-w-xl px-4 py-12">
          <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            <CreditCard className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="text-2xl font-serif font-bold">{t("Complete Membership Payment", "Complete Membership Payment")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Your registration is saved. Complete payment to activate your membership.", "आपका पंजीकरण सुरक्षित है। सदस्यता सक्रिय करने के लिए भुगतान पूरा करें।")}
            </p>
            <div className="my-6 rounded-lg bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">{t("Amount Payable", "भुगतान योग्य राशि")}</p>
              <p className="text-3xl font-bold text-primary">₹{registration.payment.amount}</p>
            </div>
            <Button className="w-full py-6" disabled={isPaying} onClick={() => startRazorpayPayment(registration)}>
              {isPaying ? t("Opening Razorpay...", "Razorpay खुल रहा है...") : t("Pay with Razorpay", "Pay with Razorpay")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Users className="mx-auto mb-4 h-12 w-12" />
          <h1 className="text-4xl font-serif font-bold">{t("Become a Member", "Become a Member")}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/80">
            {t(
              "Submit your membership request and pay the fee according to the selected membership type.",
              "अपना सदस्यता अनुरोध जमा करें और चुने गए सदस्यता प्रकार के अनुसार शुल्क भुगतान करें।",
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-serif font-bold">{t("Registration Form", "Registration Form")}</h2>
          {referralCode && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              Member referral applied: <span className="font-semibold">{referralCode}</span>
            </div>
          )}
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">{t("Full Name *", "Full Name *")}</Label>
              <Input id="name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} required />
            </div>

            <div>
              <Label htmlFor="email">{t("Email *", "Email *")}</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="phone">{t("Phone *", "Phone *")}</Label>
              <Input id="phone" value={form.phone} onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))} required />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">{t("Date of Birth", "Date of Birth")}</Label>
              <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(event) => setForm((previous) => ({ ...previous, dateOfBirth: event.target.value }))} />
            </div>

            <div>
              <Label htmlFor="password">{t("Password *", "Password *")}</Label>
              <Input id="password" type="password" value={form.password} onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))} required />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">{t("Address", "Address")}</Label>
              <Input id="address" value={form.address} onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))} />
            </div>

            <div>
              <Label htmlFor="city">{t("City", "City")}</Label>
              <Input id="city" value={form.city} onChange={(event) => setForm((previous) => ({ ...previous, city: event.target.value }))} />
            </div>
            <div>
              <Label htmlFor="state">{t("State", "State")}</Label>
              <Input id="state" value={form.state} onChange={(event) => setForm((previous) => ({ ...previous, state: event.target.value }))} />
            </div>

            <div className="md:col-span-2">
              <Label>{t("Membership Type", "Membership Type")}</Label>
              <Select value={form.membershipType} onValueChange={(value) => setForm((previous) => ({ ...previous, membershipType: value as MembershipType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General - ₹500</SelectItem>
                  <SelectItem value="active">Active - ₹1,100</SelectItem>
                  <SelectItem value="lifetime">Lifetime - ₹5,100</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("Membership fee", "सदस्यता शुल्क")}: <span className="font-semibold text-foreground">₹{selectedFee}</span>
              </p>
            </div>

            <div className="md:col-span-2">
              <MemberPhotoUpload
                value={form.photo}
                onChange={(photo) => setForm((previous) => ({ ...previous, photo }))}
                label={t("Passport Photo (for ID Card)", "पासपोर्ट फोटो (ID कार्ड के लिए)")}
              />
            </div>

            <div>
              <Label htmlFor="education">{t("Education", "शिक्षा")}</Label>
              <Select value={form.education} onValueChange={(value) => setForm((previous) => ({ ...previous, education: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select education", "शिक्षा चुनें")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secondary">Secondary School (10th/12th)</SelectItem>
                  <SelectItem value="undergraduate">Undergraduate / Bachelor&apos;s Degree</SelectItem>
                  <SelectItem value="postgraduate">Postgraduate / Master&apos;s Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate / Ph.D.</SelectItem>
                  <SelectItem value="diploma">Diploma / Technical Certification</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="donationPurpose">{t("Donation Purpose", "दान उद्देश्य")}</Label>
              <Select value={form.donationPurpose} onValueChange={(value) => setForm((previous) => ({ ...previous, donationPurpose: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select purpose", "उद्देश्य चुनें")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child-education">Child Education & Literacy</SelectItem>
                  <SelectItem value="healthcare">Healthcare & Medical Camps</SelectItem>
                  <SelectItem value="poverty-alleviation">Poverty Alleviation & Food Security</SelectItem>
                  <SelectItem value="women-empowerment">Women Empowerment</SelectItem>
                  <SelectItem value="environment">Environmental Sustainability & Planting</SelectItem>
                  <SelectItem value="skill-development">Skill Development & Livelihood</SelectItem>
                  <SelectItem value="general">General / Wherever the Need is Greatest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 rounded-md bg-muted/50 p-3 border border-border/60">
  <p className="text-xs text-muted-foreground leading-relaxed">
    <span className="font-semibold text-foreground">
      {t("Note:", "नोट:")}{" "}
    </span>
    {t(
      "Member fees are non-refundable. These will be considered as a donation against your membership registration.",
      "सदस्यता शुल्क गैर-वापसी योग्य (non-refundable) है। इसे आपके सदस्यता पंजीकरण के बदले दान के रूप में माना जाएगा।"
    )}
  </p>
</div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting || isPaying} className="w-full py-6">
                {isSubmitting ? t("Submitting...", "जमा हो रहा है...") : t("Submit & Continue", "Submit & Continue")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
