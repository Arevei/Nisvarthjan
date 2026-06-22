"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useLoginMember } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Shield } from "lucide-react";

export default function Login() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { setToken, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMember = useLoginMember();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, user]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loginMember.mutate(
      { data: { email, password } },
      {
        onSuccess: (response) => {
          setToken(response.token);
          toast({ title: t("Welcome back!", "आपका फिर से स्वागत है!") });
          router.replace("/dashboard");
        },
        onError: (error: unknown) => {
          const payload = error as { error?: string };
          toast({
            title: payload?.error || t("Invalid email or password", "ईमेल या पासवर्ड गलत है"),
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Layout>
      <div className="min-h-[80vh] px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-serif font-bold text-foreground">
              {t("Member Login", "सदस्य लॉगिन")}
            </h1>
            <p className="text-muted-foreground">{t("Access your member dashboard", "अपने सदस्य डैशबोर्ड तक पहुंचें")}</p>
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("Email Address", "ईमेल पता")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password">{t("Password", "पासवर्ड")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
                <div className="mt-2 text-right">
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    {t("Forgot password?", "पासवर्ड भूल गए?")}
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full py-6" disabled={loginMember.isPending}>
                <LogIn className="mr-2 h-4 w-4" />
                {loginMember.isPending ? t("Logging in...", "लॉगिन हो रहा है...") : t("Login", "लॉगिन")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("Not a member yet?", "अभी सदस्य नहीं हैं?")}{" "}
              <Link href="/membership" className="font-medium text-primary hover:underline">
                {t("Register here", "यहां पंजीकरण करें")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
