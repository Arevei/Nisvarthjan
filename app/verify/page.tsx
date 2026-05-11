"use client";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useVerifyCertificate, getVerifyCertificateQueryKey } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Shield, Search } from "lucide-react";

export default function Verify() {
  const { t } = useLanguage();
  const [certificateNumber, setCertificateNumber] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [queryParams, setQueryParams] = useState<{ certificateNumber: string; contact?: string } | null>(null);

  const { data, isLoading } = useVerifyCertificate(
    queryParams ?? { certificateNumber: "" },
    {
      query: {
        enabled: submitted && !!queryParams?.certificateNumber,
        queryKey: getVerifyCertificateQueryKey(queryParams ?? { certificateNumber: "" }),
        retry: false,
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryParams({ certificateNumber, contact: contact || undefined });
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold mb-3">{t("Certificate Verification", "प्रमाणपत्र सत्यापन")}</h1>
          <p className="text-xl text-primary-foreground/80 max-w-xl mx-auto">
            {t("Verify the authenticity of membership and training certificates issued by NSF.", "NSF द्वारा जारी सदस्यता और प्रशिक्षण प्रमाणपत्रों की प्रामाणिकता जांचें।")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-xl">
        <div className="bg-card border rounded-2xl p-8 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cert-no">{t("Certificate Number *", "प्रमाणपत्र संख्या *")}</Label>
              <Input
                data-testid="input-certificate-number"
                id="cert-no"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="CERT-NSF-2024-XXXXXX"
                required
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="contact">{t("Mobile / Email (optional)", "मोबाइल / ईमेल (वैकल्पिक)")}</Label>
              <Input
                data-testid="input-contact"
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t("For additional verification", "अतिरिक्त सत्यापन के लिए")}
              />
            </div>
            <Button data-testid="button-verify" type="submit" className="w-full bg-primary hover:bg-primary/90 py-6" disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? t("Verifying...", "सत्यापित हो रहा है...") : t("Verify Certificate", "प्रमाणपत्र सत्यापित करें")}
            </Button>
          </form>
        </div>

        {submitted && data && (
          <div data-testid={`verify-result-${data.isValid ? "valid" : "invalid"}`} className={`rounded-2xl p-8 border-2 ${data.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              {data.isValid ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
              <h2 className={`text-xl font-serif font-bold ${data.isValid ? "text-green-800" : "text-red-800"}`}>
                {data.isValid ? t("Certificate Valid", "प्रमाणपत्र वैध है") : t("Certificate Not Found", "प्रमाणपत्र नहीं मिला")}
              </h2>
            </div>
            {data.isValid && (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">{t("Certificate No.", "प्रमाणपत्र संख्या:")}</dt><dd className="font-mono font-medium text-foreground">{data.certificateNumber}</dd></div>
                {data.memberName && <div className="flex justify-between"><dt className="text-muted-foreground">{t("Member Name:", "सदस्य का नाम:")}</dt><dd className="font-medium text-foreground">{data.memberName}</dd></div>}
                {data.membershipType && <div className="flex justify-between"><dt className="text-muted-foreground">{t("Membership Type:", "सदस्यता प्रकार:")}</dt><dd className="font-medium text-foreground capitalize">{data.membershipType}</dd></div>}
                {data.issuedAt && <div className="flex justify-between"><dt className="text-muted-foreground">{t("Issued On:", "जारी किया:")}</dt><dd className="font-medium text-foreground">{new Date(data.issuedAt).toLocaleDateString("hi-IN")}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted-foreground">{t("Status:", "स्थिति:")}</dt><dd className="font-semibold text-green-700 capitalize">{data.status}</dd></div>
              </dl>
            )}
            {!data.isValid && (
              <p className="text-red-700 text-sm">{t("No valid certificate found with the provided details. Please check the number and try again.", "प्रदान किए गए विवरण के साथ कोई वैध प्रमाणपत्र नहीं मिला।")}</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}




