"use client";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useSubmitContact } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, CheckCircle, MessageSquare } from "lucide-react";

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const submitContact = useSubmitContact();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate(
      { data: { name: form.name, email: form.email, phone: form.phone, message: form.message } },
      {
        onSuccess: () => { setSent(true); toast({ title: t("Message sent!", "संदेश भेजा गया!") }); },
        onError: () => toast({ title: t("Failed to send message", "संदेश भेजने में विफल"), variant: "destructive" }),
      }
    );
  };

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          {/* <MessageSquare className="w-12 h-12 mx-auto mb-4" /> */}
          <h1 className="text-4xl font-serif font-bold mb-3">{t("Contact Us", "संपर्क करें")}</h1>
          <p className="text-xl text-primary-foreground/80 max-w-xl mx-auto">
            {t("We'd love to hear from you. Reach out for any queries or to join our mission.", "हम आपसे सुनना पसंद करेंगे। किसी भी प्रश्न के लिए या हमारे मिशन में शामिल होने के लिए संपर्क करें।")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {[
            { icon: MapPin, title: t("Address", "पता"), text: t("C/o Mayank Singh Sikarwar, Vill. & Po. Tihar Thana, Rampura (Jalaun), Jalaun, Jalaun, Uttar Pradesh, India, 285127", " केयर ऑफ़ मयंक सिंह सिकरवार, ग्राम व पोस्ट टीहर थाना, रामपुरा (जालौन), जालौन, जालौन, उत्तर प्रदेश, भारत, 285127")} ,
            { icon: Phone, title: t("Phone", "फोन"), text: "+91 73806 26179 / +91 88516 26084" },
            { icon: Mail, title: t("Email", "ईमेल"), text: "nisvarthjansevango@gmail.com" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card border rounded-xl p-6 flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-serif font-bold text-green-800 mb-2">{t("Message Sent!", "संदेश भेजा गया!")}</h2>
            <p className="text-green-700">{t("We'll get back to you within 24 hours.", "हम 24 घंटों के भीतर आपसे संपर्क करेंगे।")}</p>
          </div>
        ) : (
          <div className="bg-card border rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6">{t("Send Us a Message", "हमें संदेश भेजें")}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t("Full Name *", "पूरा नाम *")}</Label>
                <Input data-testid="input-name" id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="email">{t("Email *", "ईमेल *")}</Label>
                <Input data-testid="input-email" id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="phone">{t("Mobile Number", "मोबाइल नंबर")}</Label>
                <Input data-testid="input-phone" id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="message">{t("Message *", "संदेश *")}</Label>
                <Textarea data-testid="input-message" id="message" rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Button data-testid="button-send-message" type="submit" className="w-full bg-primary hover:bg-primary/90 py-6" disabled={submitContact.isPending}>
                  {submitContact.isPending ? t("Sending...", "भेज रहा है...") : t("Send Message", "संदेश भेजें")}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}




