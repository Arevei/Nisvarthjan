"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useRegisterMember } from "@/lib/api-client/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock3, Mail, Users } from "lucide-react";

type Step = "form" | "submitted";

export default function Membership() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const registerMember = useRegisterMember();

  const [step, setStep] = useState<Step>("form");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "",
    membershipType: "general",
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    registerMember.mutate(
      {
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          membershipType: form.membershipType as "general" | "active" | "lifetime",
        },
      },
      {
        onSuccess: () => {
          setSubmittedEmail(form.email);
          setStep("submitted");
          toast({ title: "Membership request submitted successfully" });
        },
        onError: (error: unknown) => {
          const payload = error as { error?: string };
          toast({ title: payload?.error || "Registration failed", variant: "destructive" });
        },
      },
    );
  };

  if (step === "submitted") {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-center text-2xl font-serif font-bold">Request Submitted</h1>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
              Your membership application is now in the foundation review queue.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                <Clock3 className="mx-auto h-5 w-5 text-amber-600" />
                <p className="mt-2 text-xs font-semibold uppercase text-zinc-500">Step 1</p>
                <p className="text-sm">Foundation verification</p>
              </div>
              <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                <Mail className="mx-auto h-5 w-5 text-blue-600" />
                <p className="mt-2 text-xs font-semibold uppercase text-zinc-500">Step 2</p>
                <p className="text-sm">Payment QR sent on email</p>
              </div>
              <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                <Users className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-2 text-xs font-semibold uppercase text-zinc-500">Step 3</p>
                <p className="text-sm">Manual activation by team</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
              <p className="font-medium">Registered Email:</p>
              <p className="text-muted-foreground">{submittedEmail}</p>
              <p className="mt-3 text-muted-foreground">
                Please watch this inbox. After approval, payment details and QR image will be sent by the foundation team.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <Users className="mx-auto mb-4 h-12 w-12" />
          <h1 className="text-4xl font-serif font-bold">Become a Member</h1>
          <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/80">
            Submit your membership request. The foundation team will review it and send payment QR manually on approval.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-serif font-bold">{t("Registration Form", "Registration Form")}</h2>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} required />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" value={form.phone} onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))} required />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={form.password} onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))} required />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))} />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(event) => setForm((previous) => ({ ...previous, city: event.target.value }))} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={(event) => setForm((previous) => ({ ...previous, state: event.target.value }))} />
            </div>

            <div className="md:col-span-2">
              <Label>Membership Type</Label>
              <Select value={form.membershipType} onValueChange={(value) => setForm((previous) => ({ ...previous, membershipType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={registerMember.isPending} className="w-full py-6">
                {registerMember.isPending ? "Submitting..." : "Submit Membership Request"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
