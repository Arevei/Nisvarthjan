"use client";
import { useState } from "react";
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
  const { setToken } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMember = useLoginMember();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMember.mutate(
      { data: { email, password } },
      {
        onSuccess: (res) => {
          setToken(res.token);
          toast({ title: t("Welcome back!", "वापस स्वागत है!") });
          router.push("/dashboard");
        },
        onError: () => {
          toast({ title: t("Invalid email or password", "अमान्य ईमेल या पासवर्ड"), variant: "destructive" });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t("Member Login", "सदस्य लॉगिन")}</h1>
            <p className="text-muted-foreground">{t("Access your membership dashboard", "अपना सदस्यता डैशबोर्ड एक्सेस करें")}</p>
          </div>

          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("Email Address", "ईमेल पता")}</Label>
                <Input data-testid="input-email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="password">{t("Password", "पासवर्ड")}</Label>
                <Input data-testid="input-password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700">
                {t("Demo: member@demo.com / member123", "डेमो: member@demo.com / member123")}
              </div>
              <Button data-testid="button-login" type="submit" className="w-full bg-primary hover:bg-primary/90 py-6" disabled={loginMember.isPending}>
                <LogIn className="w-4 h-4 mr-2" />
                {loginMember.isPending ? t("Logging in...", "लॉगिन हो रहा है...") : t("Login", "लॉगिन करें")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("Not a member yet?", "अभी तक सदस्य नहीं?")} {" "}
              <Link href="/membership" className="text-primary font-medium hover:underline">
                {t("Register here", "यहाँ पंजीकरण करें")}
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t text-center">
              <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Shield className="w-3 h-3" />
                {t("Admin Login", "व्यवस्थापक लॉगिन")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}





