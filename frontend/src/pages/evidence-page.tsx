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
  Zap
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
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.source_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.usage_reason || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.source_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const typeCounts = {
    all: currentData.length,
    news: currentData.filter((e) => e.source_type.toLowerCase() === "news").length,
    policy: currentData.filter((e) => e.source_type.toLowerCase() === "policy").length,
    dataset: currentData.filter((e) => e.source_type.toLowerCase() === "dataset" || e.source_type.toLowerCase() === "source").length,
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
                : `Total Indexed Knowledge Base (${libraryEvidence.length} Chunks)`}
            </p>
          </div>

          <div className="flex p-1.5 bg-muted/50 rounded-2xl border border-border/50 backdrop-blur-sm self-start md:self-auto">
            <button
              onClick={() => setActiveTab("used")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                activeTab === "used"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="w-4 h-4" />
              Used Evidence
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                activeTab === "library"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="w-4 h-4" />
              Intelligence Library
            </button>
          </div>
        </div>


        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t("search_sources")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-card/50 border-border/60 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-56 h-14 rounded-2xl bg-card/50 border-border/60 font-bold">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border rounded-2xl shadow-2xl">
              <SelectItem value="all" className="rounded-xl my-1 mx-2">{t("all_types")} ({typeCounts.all})</SelectItem>
              <SelectItem value="news" className="rounded-xl my-1 mx-2">{t("news")} ({typeCounts.news})</SelectItem>
              <SelectItem value="policy" className="rounded-xl my-1 mx-2">{t("policy")} ({typeCounts.policy})</SelectItem>
              <SelectItem value="dataset" className="rounded-xl my-1 mx-2">{t("dataset")} ({typeCounts.dataset})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { type: "news", label: t("news"), count: typeCounts.news, Icon: Newspaper, color: "text-primary" },
            { type: "policy", label: t("policy"), count: typeCounts.policy, Icon: FileText, color: "text-info" },
            { type: "dataset", label: t("dataset"), count: typeCounts.dataset, Icon: Database, color: "text-warning" },
          ].map(({ type, label, count, Icon, color }) => (
            <div
              key={type}
              className={cn(
                "card-elevated p-6 cursor-pointer group transition-all duration-500",
                typeFilter === type ? "ring-2 ring-primary bg-primary/[0.02]" : "hover:border-primary/20"
              )}
              onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
            >
              <div className="flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl bg-muted group-hover:scale-110 transition-transform flex items-center justify-center")}>
                  <Icon className={cn("w-7 h-7", color)} />
                </div>
                <div>
                  <p className="text-3xl font-display font-black text-foreground">
                    {loading ? "..." : count}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>


        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">{t("loading_evidence")}</p>
            </div>
          ) : filteredEvidence.length === 0 ? (
            <div className="card-elevated p-20 text-center bg-muted/20 border-dashed">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                No intelligence strings found
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {activeTab === "used"
                  ? "Run your first analysis to see the specific data points retrieved for your startup."
                  : "The intelligence library is currently being localized or no data matches your filters."}
              </p>
            </div>
          ) : (
            filteredEvidence.map((item, index) => {
              const Icon = typeIcons[item.source_type as keyof typeof typeIcons] || FileText;
              return (
                <div key={index} className="card-interactive p-6 animate-slide-up bg-card/40 backdrop-blur-sm group" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                      <Icon className="w-7 h-7 text-primary/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] uppercase">
                              {item.source_type}
                            </Badge>
                            <span className="text-xs font-bold text-muted-foreground lowercase tracking-tighter opacity-60">
                              via {item.source_name || "Internal Knowledge Base"}
                            </span>
                          </div>
                          <h3 className="text-lg font-display font-bold text-foreground leading-tight">
                            {item.title}
                          </h3>

                          {activeTab === "used" ? (
                            <div className="p-3 bg-primary/5 rounded-xl inline-block mt-2">
                              <p className="text-xs font-bold text-primary flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5" />
                                {t("used_for")}: {item.usage_reason}
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground mt-2 font-medium bg-muted/30 p-4 rounded-xl prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{item.content || "Deep market intelligence chunk processed and indexed."}</ReactMarkdown>
                            </div>
                          )}

                          <div className="flex items-center gap-4 pt-2">
                            <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                              PROCESSED {item.year || 2024}
                            </div>
                            {item.sector && (
                              <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                                SECTOR: {item.sector}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-12 h-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                          onClick={() => item.url && window.open(item.url, '_blank')}
                          disabled={!item.url}
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}