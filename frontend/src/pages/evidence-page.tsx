import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Search,
  ExternalLink,
  Newspaper,
  FileText,
  Database,
  Filter,
  Layers,
  Sparkles,
  Zap,
  Globe,

  Users,
  Tag
} from "lucide-react";
import { getAllEvidence, getIntelligenceLibrary } from "../services/api";
import type { EvidenceUsed } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";

const typeIcons = {
  news: Newspaper,
  policy: FileText,
  dataset: Database,
  News: Newspaper,
  Policy: FileText,
  Dataset: Database,
};

export default function Evidence() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"used" | "library">("used");
  const [usedEvidence, setUsedEvidence] = useState<EvidenceUsed[]>([]);
  const [libraryEvidence, setLibraryEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (activeTab === "used") {
          const data = await getAllEvidence(user?.id);
          setUsedEvidence(data);
        } else {
          const data = await getIntelligenceLibrary();
          setLibraryEvidence(data);
        }
      } catch (error) {
        console.error("Failed to fetch evidence:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const currentData = activeTab === "used" ? usedEvidence : libraryEvidence;

  const filteredEvidence = currentData.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.source_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.usage_reason || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sector || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.source_type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const typeCounts = {
    all: currentData.length,
    news: currentData.filter((e) => e.source_type?.toLowerCase() === "news").length,
    policy: currentData.filter((e) => e.source_type?.toLowerCase() === "policy").length,
    dataset: currentData.filter((e) => ["dataset", "source"].includes(e.source_type?.toLowerCase())).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-foreground tracking-tight uppercase">
              {t("evidence")} & Intelligence
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {activeTab === "used"
                ? `${t("report_desc")} (${usedEvidence.length} ${t("total_sources")})`
                : `Verified High-Fidelity Knowledge Base (${libraryEvidence.length} Chunks)`}
            </p>
          </div>

          <div className="flex p-1 bg-muted/80 rounded-2xl border border-border/10 backdrop-blur-xl self-start md:self-auto shadow-inner">
            <button
              onClick={() => setActiveTab("used")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                activeTab === "used"
                  ? "bg-card text-primary shadow-lg border border-border/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="w-4 h-4" />
              Analysis Baseline
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                activeTab === "library"
                  ? "bg-card text-primary shadow-lg border border-border/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="w-4 h-4" />
              Intel Repository
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
            <Input
              placeholder="Search by keywords, sectors, or sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-card/40 border-border/40 focus:ring-primary/20 backdrop-blur-sm transition-all font-medium placeholder:text-muted-foreground/40"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-56 h-14 rounded-2xl bg-card/40 border-border/40 font-bold backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Filter by type" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
              <SelectItem value="all" className="rounded-xl my-1 mx-2">{t("all_types")} ({typeCounts.all})</SelectItem>
              <SelectItem value="news" className="rounded-xl my-1 mx-2">Article/News ({typeCounts.news})</SelectItem>
              <SelectItem value="policy" className="rounded-xl my-1 mx-2">Regulatory Policy ({typeCounts.policy})</SelectItem>
              <SelectItem value="dataset" className="rounded-xl my-1 mx-2">Market Data ({typeCounts.dataset})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { type: "news", label: "News & PR", count: typeCounts.news, Icon: Newspaper, color: "text-primary", bg: "bg-primary/10" },
            { type: "policy", label: "Regulation", count: typeCounts.policy, Icon: FileText, color: "text-info", bg: "bg-info/10" },
            { type: "dataset", label: "Datasets", count: typeCounts.dataset, Icon: Database, color: "text-warning", bg: "bg-warning/10" },
          ].map(({ type, label, count, Icon, color, bg }) => (
            <div
              key={type}
              className={cn(
                "card-elevated p-6 cursor-pointer group transition-all duration-500 overflow-hidden relative",
                typeFilter === type ? "ring-2 ring-primary/40 bg-primary/[0.03]" : "hover:border-primary/20 hover:bg-card/80"
              )}
              onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
            >
              <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                <Icon className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-5 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl group-hover:scale-110 transition-transform flex items-center justify-center", bg)}>
                  <Icon className={cn("w-7 h-7", color)} />
                </div>
                <div>
                  <p className="text-3xl font-display font-black text-foreground">
                    {loading ? "..." : count}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 animate-pulse">
              <div className="w-16 h-16 rounded-3xl border-4 border-primary/20 border-t-primary animate-spin mb-6" />
              <p className="text-muted-foreground font-display font-bold uppercase tracking-widest">{t("loading_evidence")}</p>
            </div>
          ) : filteredEvidence.length === 0 ? (
            <div className="card-elevated p-20 text-center bg-card/20 border-dashed border-2 group transition-all">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                <div className="relative w-full h-full rounded-3xl bg-card border border-border flex items-center justify-center">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-black text-foreground mb-3">
                No matching intelligence
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                {activeTab === "used"
                  ? "We haven't found specific evidence for your requested startup yet. Run an analysis to begin."
                  : "The repository doesn't have chunks matching your current search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredEvidence.map((item, index) => {
                const Icon = typeIcons[item.source_type as keyof typeof typeIcons] || FileText;
                const isLibrary = activeTab === "library";

                return (
                  <div key={index} className="card-elevated p-0 overflow-hidden animate-slide-up bg-card/30 backdrop-blur-md hover:bg-card/50 transition-all border-border/40 group" style={{ animationDelay: `${index * 40}ms` }}>
                    <div className="flex flex-col md:flex-row min-h-[160px]">
                      {/* Left Sidebar/Icon Section */}
                      <div className="w-full md:w-20 bg-muted/40 md:border-r border-border/40 flex md:flex-col items-center justify-center gap-4 py-4 shrink-0 transition-colors group-hover:bg-primary/[0.02]">
                        <div className="w-12 h-12 rounded-2xl bg-card border border-border/60 flex items-center justify-center shadow-sm group-hover:rotate-12 transition-all">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="hidden md:block h-px w-8 bg-border/60" />
                        <div className="text-[10px] font-black text-muted-foreground/40 rotate-0 md:rotate-90 uppercase tracking-widest whitespace-nowrap">
                          {item.published_year || item.year || 2024}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-6 md:p-8">
                        <div className="flex flex-col h-full">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] py-0.5 uppercase">
                              {item.source_type}
                            </Badge>
                            {item.geography && (
                              <Badge variant="outline" className="bg-info/5 text-info border-info/20 font-black text-[10px] py-0.5 uppercase flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {item.geography}
                              </Badge>
                            )}
                            {item.sector && (
                              <Badge variant="outline" className="bg-warning/5 text-warning border-warning/20 font-black text-[10px] py-0.5 uppercase flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {item.sector}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-start justify-between gap-6">
                            <div className="space-y-4 flex-1">
                              <div>
                                <h3 className="text-xl font-display font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                                  {item.title}
                                </h3>
                                <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-tight">
                                  Source: {item.source_name || "Internal Intelligence"}
                                </p>
                              </div>

                              {isLibrary ? (
                                <div className="text-sm text-foreground/80 font-medium leading-relaxed bg-muted/30 p-5 rounded-2xl border border-border/40 prose prose-sm dark:prose-invert max-w-none relative overflow-hidden group-hover:bg-muted/50 transition-colors">
                                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-8 h-8" />
                                  </div>
                                  <ReactMarkdown>{item.content || "Market intelligence chunk processed and indexed."}</ReactMarkdown>
                                </div>
                              ) : (
                                <div className="flex items-start gap-4 p-4 bg-primary/[0.03] rounded-2xl border border-primary/10">
                                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Zap className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Reason for Inference</p>
                                    <p className="text-sm font-bold text-foreground/70">{item.usage_reason}</p>
                                  </div>
                                </div>
                              )}

                              {item.investors && item.investors.length > 0 && (
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase opacity-40">
                                    <Users className="w-3.5 h-3.5" />
                                    Investors:
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.investors.slice(0, 5).map((inv: any, i: number) => (
                                      <span key={i} className="text-[11px] font-bold bg-muted/50 px-2 py-0.5 rounded-lg border border-border/60">
                                        {inv}
                                      </span>
                                    ))}
                                    {item.investors.length > 5 && (
                                      <span className="text-[11px] font-bold text-muted-foreground/60">
                                        +{item.investors.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-14 h-14 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 shrink-0 shadow-sm border border-border/10 group-hover:shadow-glow/20"
                              onClick={() => item.url && window.open(item.url, '_blank')}
                              disabled={!item.url}
                            >
                              <ExternalLink className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}