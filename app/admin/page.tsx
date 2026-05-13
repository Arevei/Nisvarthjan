"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useAdminAuth } from "@/lib/admin-auth-context";
import {
  useListNews, useDeleteNewsArticle, useCreateNewsArticle, getListNewsQueryKey,
  useListMembers, getListMembersQueryKey,
  useListDonations,
  useListCampaigns, getListCampaignsQueryKey, useCreateCampaign,
  useUpdateMember,
  useUpdateCampaign,
  useIssueCertificate,
  useListContacts,
  useListGallery,
  getListGalleryQueryKey,
} from "@/lib/api-client/api";
import type { Campaign, GalleryImage } from "@/lib/api-client/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2, Plus, Users, DollarSign, Newspaper, Target, X, LogOut,
  Award, MessageSquare, CheckCircle, ToggleLeft, ToggleRight, Shield, Edit2, Save,
  Image as ImageIcon,
} from "lucide-react";

type Tab = "news" | "members" | "donations" | "campaigns" | "gallery" | "contacts";

const CAMPAIGN_CATEGORIES = ["education", "health", "environment", "women", "rural", "disaster", "general"];

const emptyCampaignForm = {
  title: "", titleHindi: "", description: "", descriptionHindi: "",
  goalAmount: "", category: "general", imageUrl: "", isActive: true,
};

const emptyGalleryForm = {
  imageUrl: "",
  caption: "",
  captionHindi: "",
  category: "events",
};

export default function Admin() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isAdmin, isAdminLoading, adminLogout } = useAdminAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("news");
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [certResult, setCertResult] = useState<Record<number, string>>({});
  const [galleryBusy, setGalleryBusy] = useState(false);

  const [newsForm, setNewsForm] = useState({
    title: "", titleHindi: "", content: "", contentHindi: "", excerpt: "", category: "general", author: "",
  });
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);
  const [editForm, setEditForm] = useState(emptyCampaignForm);
  const [galleryForm, setGalleryForm] = useState(emptyGalleryForm);

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isAdmin, isAdminLoading, router]);

  const { data: news = [] } = useListNews();
  const { data: members = [] } = useListMembers();
  const { data: donations = [] } = useListDonations();
  const { data: campaigns = [] } = useListCampaigns();
  const { data: contacts = [] } = useListContacts();
  const { data: gallery = [] } = useListGallery();

  const deleteNews = useDeleteNewsArticle();
  const createNews = useCreateNewsArticle();
  const createCampaign = useCreateCampaign();
  const updateMember = useUpdateMember();
  const updateCampaign = useUpdateCampaign();
  const issueCertificate = useIssueCertificate();

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  const handleDeleteNews = (id: number) => {
    deleteNews.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
        toast({ title: t("Article deleted", "लेख हटाया गया") });
      },
    });
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    createNews.mutate(
      { data: { title: newsForm.title, titleHindi: newsForm.titleHindi, content: newsForm.content, contentHindi: newsForm.contentHindi, excerpt: newsForm.excerpt, category: newsForm.category, author: newsForm.author } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
          setShowNewsForm(false);
          setNewsForm({ title: "", titleHindi: "", content: "", contentHindi: "", excerpt: "", category: "general", author: "" });
          toast({ title: t("Article created", "लेख बनाया गया") });
        },
        onError: () => toast({ title: t("Failed to create article", "लेख बनाने में विफल"), variant: "destructive" }),
      }
    );
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const goal = parseFloat(campaignForm.goalAmount);
    if (isNaN(goal) || goal <= 0) {
      toast({ title: t("Enter a valid goal amount", "वैध लक्ष्य राशि दर्ज करें"), variant: "destructive" });
      return;
    }
    createCampaign.mutate(
      {
        data: {
          title: campaignForm.title,
          titleHindi: campaignForm.titleHindi || undefined,
          description: campaignForm.description,
          descriptionHindi: campaignForm.descriptionHindi || undefined,
          goalAmount: goal,
          category: campaignForm.category,
          imageUrl: campaignForm.imageUrl || undefined,
          isActive: campaignForm.isActive,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
          setShowCampaignForm(false);
          setCampaignForm(emptyCampaignForm);
          toast({ title: t("Campaign created!", "अभियान बनाया गया!") });
        },
        onError: () => toast({ title: t("Failed to create campaign", "अभियान बनाने में विफल"), variant: "destructive" }),
      }
    );
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.imageUrl.trim()) {
      toast({ title: t("Image URL is required", "छवि URL आवश्यक है"), variant: "destructive" });
      return;
    }

    setGalleryBusy(true);
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(galleryForm),
      });

      if (!response.ok) throw new Error("Create failed");
      queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
      setGalleryForm(emptyGalleryForm);
      setShowGalleryForm(false);
      toast({ title: t("Gallery image added", "गैलरी छवि जोड़ी गई") });
    } catch {
      toast({ title: t("Failed to add gallery image", "गैलरी छवि जोड़ने में विफल"), variant: "destructive" });
    } finally {
      setGalleryBusy(false);
    }
  };

  const handleDeleteGalleryItem = async (item: GalleryImage) => {
    setGalleryBusy(true);
    try {
      const response = await fetch(`/api/gallery/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Delete failed");
      queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
      toast({ title: t("Gallery image deleted", "गैलरी छवि हटाई गई") });
    } catch {
      toast({ title: t("Failed to delete gallery image", "गैलरी छवि हटाने में विफल"), variant: "destructive" });
    } finally {
      setGalleryBusy(false);
    }
  };

  const startEditCampaign = (c: Campaign) => {
    setEditingCampaignId(c.id);
    setEditForm({
      title: c.title,
      titleHindi: c.titleHindi ?? "",
      description: c.description,
      descriptionHindi: c.descriptionHindi ?? "",
      goalAmount: String(c.goalAmount),
      category: c.category,
      imageUrl: c.imageUrl ?? "",
      isActive: c.isActive,
    });
  };

  const handleSaveEditCampaign = (campaignId: number) => {
    const goal = parseFloat(editForm.goalAmount);
    if (isNaN(goal) || goal <= 0) {
      toast({ title: t("Enter a valid goal amount", "वैध लक्ष्य राशि दर्ज करें"), variant: "destructive" });
      return;
    }
    updateCampaign.mutate(
      {
        campaignId,
        data: {
          title: editForm.title,
          titleHindi: editForm.titleHindi || undefined,
          description: editForm.description,
          descriptionHindi: editForm.descriptionHindi || undefined,
          goalAmount: goal,
          category: editForm.category,
          isActive: editForm.isActive,
          imageUrl: editForm.imageUrl || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
          setEditingCampaignId(null);
          toast({ title: t("Campaign saved!", "अभियान सहेजा गया!") });
        },
        onError: () => toast({ title: t("Save failed", "सहेजना विफल"), variant: "destructive" }),
      }
    );
  };

  const handleMemberStatus = (id: number, status: "active" | "suspended" | "inactive") => {
    updateMember.mutate({ memberId: id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        toast({ title: t("Member status updated", "सदस्य स्थिति अपडेट की गई") });
      },
      onError: () => toast({ title: t("Update failed", "अपडेट विफल"), variant: "destructive" }),
    });
  };

  const handleIssueCert = (memberId: number) => {
    issueCertificate.mutate({ memberId }, {
      onSuccess: (res) => {
        setCertResult((prev) => ({ ...prev, [memberId]: res.certificateNumber }));
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        toast({ title: t("Certificate issued!", "प्रमाणपत्र जारी किया गया!") });
      },
      onError: () => toast({ title: t("Failed to issue certificate", "प्रमाणपत्र जारी करने में विफल"), variant: "destructive" }),
    });
  };

  if (isAdminLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse h-8 bg-muted rounded w-48 mx-auto mb-4" />
          <div className="animate-pulse h-64 bg-muted rounded" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  const tabs: { id: Tab; label: string; labelHi: string; icon: typeof Newspaper; count: number }[] = [
    { id: "news", label: "News", labelHi: "समाचार", icon: Newspaper, count: news.length },
    { id: "members", label: "Members", labelHi: "सदस्य", icon: Users, count: members.length },
    { id: "donations", label: "Donations", labelHi: "दान", icon: DollarSign, count: donations.length },
    { id: "campaigns", label: "Campaigns", labelHi: "अभियान", icon: Target, count: campaigns.length },
    { id: "gallery", label: "Gallery", labelHi: "गैलरी", icon: ImageIcon, count: gallery.length },
    { id: "contacts", label: "Messages", labelHi: "संदेश", icon: MessageSquare, count: contacts.length },
  ];

  const totalDonationAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">{t("Admin Panel", "व्यवस्थापक पैनल")}</h1>
              <p className="text-xs text-muted-foreground">{t("Nisvarthjan Seva Foundation", "निस्वार्थजन सेवा फाउंडेशन")}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" /> {t("Logout", "लॉगआउट")}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: t("Total Members", "कुल सदस्य"), value: members.length, icon: Users, color: "text-blue-600" },
            { label: t("Total Donations", "कुल दान"), value: `₹${totalDonationAmount.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-green-600" },
            { label: t("Active Campaigns", "सक्रिय अभियान"), value: campaigns.filter((c) => c.isActive).length, icon: Target, color: "text-primary" },
            { label: t("Messages", "संदेश"), value: contacts.length, icon: MessageSquare, color: "text-amber-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border rounded-xl p-4">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(({ id, label, labelHi, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === id ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:border-primary"}`}
            >
              <Icon className="w-4 h-4" />
              {t(label, labelHi)}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? "bg-white/20" : "bg-muted"}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* ─── NEWS TAB ─── */}
        {tab === "news" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">{t("News Articles", "समाचार लेख")}</h2>
              <Button onClick={() => setShowNewsForm(!showNewsForm)} className="bg-primary hover:bg-primary/90">
                {showNewsForm ? <><X className="w-4 h-4 mr-2" />{t("Cancel", "रद्द करें")}</> : <><Plus className="w-4 h-4 mr-2" />{t("Add Article", "लेख जोड़ें")}</>}
              </Button>
            </div>

            {showNewsForm && (
              <div className="bg-card border rounded-xl p-6 mb-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">{t("New Article", "नया लेख")}</h3>
                <form onSubmit={handleCreateNews} className="grid md:grid-cols-2 gap-4">
                  <div><Label>{t("Title (English) *", "शीर्षक (अंग्रेजी) *")}</Label><Input value={newsForm.title} onChange={(e) => setNewsForm((f) => ({ ...f, title: e.target.value }))} required /></div>
                  <div><Label>{t("Title (Hindi)", "शीर्षक (हिंदी)")}</Label><Input value={newsForm.titleHindi} onChange={(e) => setNewsForm((f) => ({ ...f, titleHindi: e.target.value }))} /></div>
                  <div>
                    <Label>{t("Category *", "श्रेणी *")}</Label>
                    <Select value={newsForm.category} onValueChange={(v) => setNewsForm((f) => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["general", "health", "education", "environment", "women", "rural"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t("Author", "लेखक")}</Label><Input value={newsForm.author} onChange={(e) => setNewsForm((f) => ({ ...f, author: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>{t("Excerpt", "सारांश")}</Label><Input value={newsForm.excerpt} onChange={(e) => setNewsForm((f) => ({ ...f, excerpt: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>{t("Content (English) *", "सामग्री (अंग्रेजी) *")}</Label><Textarea rows={4} value={newsForm.content} onChange={(e) => setNewsForm((f) => ({ ...f, content: e.target.value }))} required /></div>
                  <div className="md:col-span-2"><Label>{t("Content (Hindi)", "सामग्री (हिंदी)")}</Label><Textarea rows={4} value={newsForm.contentHindi} onChange={(e) => setNewsForm((f) => ({ ...f, contentHindi: e.target.value }))} /></div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={createNews.isPending}>
                      {createNews.isPending ? t("Creating...", "बना रहा है...") : t("Create Article", "लेख बनाएं")}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-2">
              {news.map((article) => (
                <div key={article.id} className="bg-card border rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{article.category}</span>
                      <span className="text-xs text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString()}</span>
                      {article.author && <span className="text-xs text-muted-foreground">· {article.author}</span>}
                    </div>
                    <h3 className="font-medium text-foreground">{article.title}</h3>
                    {article.titleHindi && <p className="text-sm text-muted-foreground">{article.titleHindi}</p>}
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0" onClick={() => handleDeleteNews(article.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {news.length === 0 && <p className="text-center py-8 text-muted-foreground">{t("No articles yet.", "अभी तक कोई लेख नहीं।")}</p>}
            </div>
          </div>
        )}

        {/* ─── MEMBERS TAB ─── */}
        {tab === "members" && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("Registered Members", "पंजीकृत सदस्य")}</h2>
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="bg-card border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{m.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-green-100 text-green-800" : m.status === "suspended" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"}`}>{m.status}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{m.membershipType}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.email} · {m.phone}</p>
                      {m.city && <p className="text-sm text-muted-foreground">{m.city}, {m.state}</p>}
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{m.membershipId}</p>
                      {(m.certificateNumber || certResult[m.id]) && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-700 font-mono">{certResult[m.id] || m.certificateNumber}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={m.status} onValueChange={(v) => handleMemberStatus(m.id, v as "active" | "suspended" | "inactive")}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">{t("Active", "सक्रिय")}</SelectItem>
                          <SelectItem value="suspended">{t("Suspended", "निलंबित")}</SelectItem>
                          <SelectItem value="inactive">{t("Inactive", "निष्क्रिय")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" className="h-8 text-xs border-primary text-primary hover:bg-primary/5" onClick={() => handleIssueCert(m.id)} disabled={issueCertificate.isPending}>
                        <Award className="w-3 h-3 mr-1" />{t("Issue Cert", "प्रमाणपत्र")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {members.length === 0 && <p className="text-center py-8 text-muted-foreground">{t("No members yet.", "अभी तक कोई सदस्य नहीं।")}</p>}
            </div>
          </div>
        )}

        {/* ─── DONATIONS TAB ─── */}
        {tab === "donations" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">{t("Donations Received", "प्राप्त दान")}</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-800 font-semibold">
                {t("Total:", "कुल:")} ₹{totalDonationAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm border-collapse bg-card">
                <thead className="bg-muted/50">
                  <tr>
                    {[t("Donor", "दानकर्ता"), t("Amount", "राशि"), t("Purpose", "उद्देश्य"), t("Receipt", "रसीद"), t("Date", "तारीख")].map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-t hover:bg-muted/20">
                      <td className="py-3 px-4"><div className="font-medium">{d.donorName}</div><div className="text-xs text-muted-foreground">{d.donorEmail}</div></td>
                      <td className="py-3 px-4 text-green-700 font-bold">₹{Number(d.amount).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{d.purpose}</td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{d.receiptNumber}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {donations.length === 0 && <p className="text-center py-8 text-muted-foreground">{t("No donations yet.", "अभी तक कोई दान नहीं।")}</p>}
            </div>
          </div>
        )}

        {/* ─── CAMPAIGNS TAB ─── */}
        {tab === "campaigns" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">{t("Campaigns", "अभियान")}</h2>
              <Button onClick={() => { setShowCampaignForm(!showCampaignForm); setEditingCampaignId(null); }} className="bg-primary hover:bg-primary/90">
                {showCampaignForm ? <><X className="w-4 h-4 mr-2" />{t("Cancel", "रद्द करें")}</> : <><Plus className="w-4 h-4 mr-2" />{t("New Campaign", "नया अभियान")}</>}
              </Button>
            </div>

            {/* Create form */}
            {showCampaignForm && (
              <div className="bg-card border-2 border-primary/20 rounded-xl p-6 mb-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 text-primary">{t("Create New Campaign", "नया अभियान बनाएं")}</h3>
                <form onSubmit={handleCreateCampaign} className="grid md:grid-cols-2 gap-4">
                  <div><Label>{t("Title (English) *", "शीर्षक (अंग्रेजी) *")}</Label><Input value={campaignForm.title} onChange={(e) => setCampaignForm((f) => ({ ...f, title: e.target.value }))} required /></div>
                  <div><Label>{t("Title (Hindi)", "शीर्षक (हिंदी)")}</Label><Input value={campaignForm.titleHindi} onChange={(e) => setCampaignForm((f) => ({ ...f, titleHindi: e.target.value }))} /></div>
                  <div>
                    <Label>{t("Category *", "श्रेणी *")}</Label>
                    <Select value={campaignForm.category} onValueChange={(v) => setCampaignForm((f) => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CAMPAIGN_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t("Goal Amount (₹) *", "लक्ष्य राशि (₹) *")}</Label><Input type="number" min={1} value={campaignForm.goalAmount} onChange={(e) => setCampaignForm((f) => ({ ...f, goalAmount: e.target.value }))} required /></div>
                  <div className="md:col-span-2"><Label>{t("Description (English) *", "विवरण (अंग्रेजी) *")}</Label><Textarea rows={3} value={campaignForm.description} onChange={(e) => setCampaignForm((f) => ({ ...f, description: e.target.value }))} required /></div>
                  <div className="md:col-span-2"><Label>{t("Description (Hindi)", "विवरण (हिंदी)")}</Label><Textarea rows={3} value={campaignForm.descriptionHindi} onChange={(e) => setCampaignForm((f) => ({ ...f, descriptionHindi: e.target.value }))} /></div>
                  <div><Label>{t("Image URL", "छवि URL")}</Label><Input type="url" value={campaignForm.imageUrl} onChange={(e) => setCampaignForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></div>
                  <div className="flex items-center gap-3 pt-6">
                    <button type="button" onClick={() => setCampaignForm((f) => ({ ...f, isActive: !f.isActive }))}>
                      {campaignForm.isActive ? <ToggleRight className="w-8 h-8 text-green-600" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                    </button>
                    <span className="text-sm">{campaignForm.isActive ? t("Active", "सक्रिय") : t("Inactive", "निष्क्रिय")}</span>
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={createCampaign.isPending}>
                      {createCampaign.isPending ? t("Creating...", "बना रहा है...") : t("Create Campaign", "अभियान बनाएं")}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Campaign list */}
            <div className="space-y-4">
              {campaigns.map((c) => {
                const pct = Math.min(100, (c.raisedAmount / c.goalAmount) * 100);
                const isEditing = editingCampaignId === c.id;
                return (
                  <div key={c.id} className="bg-card border rounded-xl overflow-hidden">
                    {/* Summary row */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-foreground">{c.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                              {c.isActive ? t("Active", "सक्रिय") : t("Inactive", "निष्क्रिय")}
                            </span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{c.category}</span>
                          </div>
                          {c.titleHindi && <p className="text-sm text-muted-foreground">{c.titleHindi}</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm" variant="outline"
                            className={`h-8 text-xs gap-1 ${isEditing ? "border-primary text-primary" : ""}`}
                            onClick={() => isEditing ? setEditingCampaignId(null) : startEditCampaign(c)}
                          >
                            {isEditing ? <><X className="w-3 h-3" />{t("Cancel", "रद्द")}</> : <><Edit2 className="w-3 h-3" />{t("Edit", "संपादित")}</>}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("Raised", "एकत्रित")}</span>
                          <span className="font-medium">₹{c.raisedAmount.toLocaleString("en-IN")} / ₹{c.goalAmount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(pct)}% {t("funded", "वित्त पोषित")}</span>
                          <span>{c.donorCount} {t("donors", "दानकर्ता")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit panel */}
                    {isEditing && (
                      <div className="border-t bg-muted/20 p-5">
                        <h4 className="font-semibold text-sm text-foreground mb-4">{t("Edit Campaign", "अभियान संपादित करें")}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div><Label className="text-xs">{t("Title (English)", "शीर्षक (अंग्रेजी)")}</Label><Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} /></div>
                          <div><Label className="text-xs">{t("Title (Hindi)", "शीर्षक (हिंदी)")}</Label><Input value={editForm.titleHindi} onChange={(e) => setEditForm((f) => ({ ...f, titleHindi: e.target.value }))} /></div>
                          <div>
                            <Label className="text-xs">{t("Category", "श्रेणी")}</Label>
                            <Select value={editForm.category} onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{CAMPAIGN_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div><Label className="text-xs">{t("Goal Amount (₹)", "लक्ष्य राशि (₹)")}</Label><Input type="number" min={1} value={editForm.goalAmount} onChange={(e) => setEditForm((f) => ({ ...f, goalAmount: e.target.value }))} /></div>
                          <div className="md:col-span-2"><Label className="text-xs">{t("Description (English)", "विवरण (अंग्रेजी)")}</Label><Textarea rows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} /></div>
                          <div className="md:col-span-2"><Label className="text-xs">{t("Description (Hindi)", "विवरण (हिंदी)")}</Label><Textarea rows={3} value={editForm.descriptionHindi} onChange={(e) => setEditForm((f) => ({ ...f, descriptionHindi: e.target.value }))} /></div>
                          <div><Label className="text-xs">{t("Image URL", "छवि URL")}</Label><Input type="url" value={editForm.imageUrl} onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))} /></div>
                          <div className="flex items-center gap-3 pt-5">
                            <button type="button" onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}>
                              {editForm.isActive ? <ToggleRight className="w-8 h-8 text-green-600" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                            </button>
                            <span className="text-sm">{editForm.isActive ? t("Active", "सक्रिय") : t("Inactive", "निष्क्रिय")}</span>
                          </div>
                          <div className="md:col-span-2">
                            <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2" onClick={() => handleSaveEditCampaign(c.id)} disabled={updateCampaign.isPending}>
                              <Save className="w-4 h-4" />{updateCampaign.isPending ? t("Saving...", "सहेज रहा है...") : t("Save Changes", "परिवर्तन सहेजें")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {campaigns.length === 0 && <p className="text-center py-8 text-muted-foreground">{t("No campaigns yet.", "अभी तक कोई अभियान नहीं।")}</p>}
            </div>
          </div>
        )}

        {/* ─── GALLERY TAB ─── */}
        {tab === "gallery" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">{t("Gallery Control", "गैलरी नियंत्रण")}</h2>
              <Button onClick={() => setShowGalleryForm(!showGalleryForm)} className="bg-primary hover:bg-primary/90">
                {showGalleryForm ? <><X className="w-4 h-4 mr-2" />{t("Cancel", "रद्द करें")}</> : <><Plus className="w-4 h-4 mr-2" />{t("Add Image", "छवि जोड़ें")}</>}
              </Button>
            </div>

            {showGalleryForm && (
              <div className="bg-card border-2 border-primary/20 rounded-xl p-6 mb-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 text-primary">{t("Add Gallery Image", "गैलरी छवि जोड़ें")}</h3>
                <form onSubmit={handleCreateGalleryItem} className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>{t("Image URL *", "छवि URL *")}</Label>
                    <Input
                      type="url"
                      value={galleryForm.imageUrl}
                      onChange={(e) => setGalleryForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <div>
                    <Label>{t("Caption (English)", "कैप्शन (अंग्रेजी)")}</Label>
                    <Input value={galleryForm.caption} onChange={(e) => setGalleryForm((f) => ({ ...f, caption: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t("Caption (Hindi)", "कैप्शन (हिंदी)")}</Label>
                    <Input value={galleryForm.captionHindi} onChange={(e) => setGalleryForm((f) => ({ ...f, captionHindi: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t("Category", "श्रेणी")}</Label>
                    <Select value={galleryForm.category} onValueChange={(v) => setGalleryForm((f) => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["events", "education", "health", "environment", "women", "rural", "general"].map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={galleryBusy}>
                      {galleryBusy ? t("Saving...", "सहेज रहा है...") : t("Save Image", "छवि सहेजें")}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gallery.map((item) => {
                const title = item.caption || item.captionHindi || t("Gallery image", "गैलरी छवि");
                return (
                  <article key={item.id} className="group relative h-64 overflow-hidden rounded-xl border bg-card shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                      {item.category}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/90 text-destructive hover:bg-white"
                      disabled={galleryBusy}
                      onClick={() => handleDeleteGalleryItem(item)}
                      aria-label={t("Delete gallery image", "गैलरी छवि हटाएँ")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <h3 className="font-serif text-lg font-bold leading-snug">{title}</h3>
                      {item.captionHindi && item.captionHindi !== title && (
                        <p className="mt-1 text-sm text-white/75">{item.captionHindi}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {gallery.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl border border-dashed">
                <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <h3 className="font-serif text-xl font-bold text-foreground">{t("No gallery images yet", "अभी कोई गैलरी छवि नहीं")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("Add image URLs here to publish them on the public gallery.", "सार्वजनिक गैलरी में दिखाने के लिए यहाँ छवि URL जोड़ें।")}</p>
              </div>
            )}
          </div>
        )}

        {/* ─── CONTACTS TAB ─── */}
        {tab === "contacts" && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("Contact Messages", "संपर्क संदेश")}</h2>
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="bg-card border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="font-semibold text-foreground">{c.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">{c.email}</span>
                      {c.phone && <span className="text-muted-foreground text-sm ml-2">· {c.phone}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">{c.message}</p>
                </div>
              ))}
              {contacts.length === 0 && <p className="text-center py-8 text-muted-foreground">{t("No messages yet.", "अभी तक कोई संदेश नहीं।")}</p>}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}





