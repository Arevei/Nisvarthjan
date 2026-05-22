"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useVerifyCertificate, getVerifyCertificateQueryKey } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, FileCheck2, Search, ShieldCheck, XCircle } from "lucide-react";

function formatDocumentType(value?: string | null) {
  return (value || "membership-certificate")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function VerifyContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialCertificateNumber = searchParams.get("certificateNumber")?.trim() || "";
  const initialDocumentType = searchParams.get("documentType")?.trim() || undefined;
  const initialContact = searchParams.get("contact")?.trim() || "";
  const [certificateNumber, setCertificateNumber] = useState(initialCertificateNumber);
  const [contact, setContact] = useState(initialContact);
  const [submitted, setSubmitted] = useState(Boolean(initialCertificateNumber));
  const [queryParams, setQueryParams] = useState<{ certificateNumber: string; contact?: string; documentType?: string } | null>(
    initialCertificateNumber
      ? {
          certificateNumber: initialCertificateNumber,
          contact: initialContact || undefined,
          documentType: initialDocumentType,
        }
      : null,
  );

  const { data, isLoading } = useVerifyCertificate(
    queryParams ?? { certificateNumber: "" },
    {
      query: {
        enabled: submitted && !!queryParams?.certificateNumber,
        queryKey: getVerifyCertificateQueryKey(queryParams ?? { certificateNumber: "" }),
        retry: false,
      },
    },
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setQueryParams({ certificateNumber: certificateNumber.trim(), contact: contact.trim() || undefined, documentType: initialDocumentType });
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12" />
          <h1 className="mb-3 text-4xl font-serif font-bold">
            {t("Document Verification", "दस्तावेज़ सत्यापन")}
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-primary-foreground/80">
            {t(
              "Scan a QR code or enter a verification number to confirm documents issued by Nisvarthjan Seva Foundation.",
              "Nisvarthjan Seva Foundation द्वारा जारी दस्तावेज़ों की पुष्टि के लिए QR कोड स्कैन करें या सत्यापन नंबर दर्ज करें।",
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cert-no">{t("Verification / Certificate Number *", "सत्यापन / प्रमाणपत्र नंबर *")}</Label>
              <Input
                data-testid="input-certificate-number"
                id="cert-no"
                value={certificateNumber}
                onChange={(event) => setCertificateNumber(event.target.value)}
                placeholder="CERT-NSF-2026-123456"
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
                onChange={(event) => setContact(event.target.value)}
                placeholder={t("Optional extra check", "वैकल्पिक अतिरिक्त जांच")}
              />
            </div>
            <Button data-testid="button-verify" type="submit" className="w-full py-6" disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? t("Verifying...", "सत्यापित हो रहा है...") : t("Verify Document", "दस्तावेज़ सत्यापित करें")}
            </Button>
          </form>
        </div>

        {submitted && data && (
          <div
            data-testid={`verify-result-${data.isValid ? "valid" : "invalid"}`}
            className={`rounded-xl border-2 p-6 ${
              data.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
          >
            <div className="mb-5 flex items-center gap-3">
              {data.isValid ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatDocumentType(data.documentType)}
                </p>
                <h2 className={`text-xl font-serif font-bold ${data.isValid ? "text-green-800" : "text-red-800"}`}>
                  {data.isValid ? t("Verified Document", "सत्यापित दस्तावेज़") : t("Document Not Verified", "दस्तावेज़ सत्यापित नहीं हुआ")}
                </h2>
              </div>
            </div>

            {data.isValid ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("Verification ID", "सत्यापन आईडी")}</dt>
                  <dd className="break-all text-right font-mono font-semibold text-foreground">
                    {data.verificationId || data.certificateNumber}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("Certificate No.", "प्रमाणपत्र नंबर")}</dt>
                  <dd className="break-all text-right font-mono font-semibold text-foreground">{data.certificateNumber}</dd>
                </div>
                {data.memberName && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t("Issued To", "जारी किया गया")}</dt>
                    <dd className="text-right font-semibold text-foreground">{data.memberName}</dd>
                  </div>
                )}
                {data.membershipId && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t("Membership ID", "सदस्यता आईडी")}</dt>
                    <dd className="text-right font-mono font-semibold text-foreground">{data.membershipId}</dd>
                  </div>
                )}
                {data.membershipType && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t("Membership Type", "सदस्यता प्रकार")}</dt>
                    <dd className="text-right font-semibold capitalize text-foreground">{data.membershipType}</dd>
                  </div>
                )}
                {data.issuedAt && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t("Issued On", "जारी तिथि")}</dt>
                    <dd className="text-right font-semibold text-foreground">
                      {new Date(data.issuedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("Status", "स्थिति")}</dt>
                  <dd className="inline-flex items-center gap-1.5 text-right font-bold text-green-700">
                    <FileCheck2 className="h-4 w-4" />
                    {t("Verified", "सत्यापित")}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-red-700">
                {t(
                  "No valid active document was found for this verification number.",
                  "इस सत्यापन नंबर के लिए कोई मान्य सक्रिय दस्तावेज़ नहीं मिला।",
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
