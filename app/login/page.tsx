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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loginMember.mutate(
      { data: { email, password } },
      {
        onSuccess: (response) => {
          setToken(response.token);
          toast({ title: t("Welcome back!", "Welcome back!") });
          router.push("/dashboard");
        },
        onError: (error: unknown) => {
          const payload = error as { error?: string };
          toast({
            title: payload?.error || t("Invalid email or password", "Invalid email or password"),
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
              Member Login
            </h1>
            <p className="text-muted-foreground">Access your member dashboard</p>
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full py-6" disabled={loginMember.isPending}>
                <LogIn className="mr-2 h-4 w-4" />
                {loginMember.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Not a member yet?{" "}
              <Link href="/membership" className="font-medium text-primary hover:underline">
                Register here
              </Link>
            </div>

            <div className="mt-4 border-t pt-4 text-center">
              <Link
                href="/admin-login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <Shield className="h-3 w-3" />
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
