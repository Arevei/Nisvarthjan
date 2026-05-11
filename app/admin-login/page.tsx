"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { useAdminLogin } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Shield } from "lucide-react";

export default function AdminLogin() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { setAdminToken } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const adminLogin = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin.mutate(
      { data: { email, password } },
      {
        onSuccess: (res) => {
          if (res.isAdmin) {
            setAdminToken(res.token);
            toast({ title: t("Admin login successful", "व्यवस्थापक लॉगिन सफल") });
            router.push("/admin");
          } else {
            toast({ title: t("Not an admin account", "व्यवस्थापक खाता नहीं"), variant: "destructive" });
          }
        },
        onError: () => {
          toast({ title: t("Invalid admin credentials", "अमान्य व्यवस्थापक प्रमाण-पत्र"), variant: "destructive" });
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
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              {t("Admin Login", "व्यवस्थापक लॉगिन")}
            </h1>
            <p className="text-muted-foreground">
              {t("Restricted access — administrators only", "प्रतिबंधित पहुंच — केवल व्यवस्थापक")}
            </p>
          </div>

          <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-primary font-medium">
                {t("Secure administrative area", "सुरक्षित प्रशासनिक क्षेत्र")}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("Admin Email", "व्यवस्थापक ईमेल")}</Label>
                <Input
                  data-testid="input-admin-email"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@nisvarthjan.org"
                />
              </div>
              <div>
                <Label htmlFor="password">{t("Password", "पासवर्ड")}</Label>
                <Input
                  data-testid="input-admin-password"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button
                data-testid="button-admin-login"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 py-6"
                disabled={adminLogin.isPending}
              >
                <Lock className="w-4 h-4 mr-2" />
                {adminLogin.isPending
                  ? t("Authenticating...", "प्रमाणीकरण हो रहा है...")
                  : t("Login to Admin Panel", "व्यवस्थापक पैनल में लॉगिन करें")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}




