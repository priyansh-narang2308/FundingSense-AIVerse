/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronDown,
  ExternalLink,
  TrendingUp,
  Building2,
  MapPin,
  Target,
  FileText,
  Lightbulb,
  Globe,
  Zap,
  Sparkles,
  Loader2
} from "lucide-react";
import { getAnalysisById } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";
import ReactMarkdown from "react-markdown";

export default function Results() {
  const { t } = useLanguage();
  const { id } = useParams();
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const analysis = await getAnalysisById(id, user?.id);

        setData({
          startup: {
            name: "Analysis Result",
            description: analysis.startup_summary,
            sector: analysis.metadata.sector || "N/A",
            stage: analysis.metadata.stage || "N/A",
            geography: analysis.metadata.geography || "N/A",
          },
          confidence: analysis.confidence_indicator,
          score: analysis.overall_score,
          investors: (analysis.recommended_investors || []).map((inv: any, index: number) => ({
            id: index,
            name: inv.name,
            logo: inv.logo_initials || inv.name.substring(0, 2).toUpperCase(),
            fitScore: inv.fit_score,
            focus: inv.focus_areas || [],
            reasons: inv.reasons || []
          })),
          whyFits: analysis.why_fits || [],
          whyDoesNotFit: analysis.why_does_not_fit || [],
          evidence: (analysis.evidence_used || []).map((ev: any) => ({
            type: ev.source_type ? (ev.source_type.charAt(0).toUpperCase() + ev.source_type.slice(1)) : "Source",
            title: ev.title,
            source: ev.source_name,
            date: ev.year,
            url: ev.url,
            relevance: ev.usage_reason,
            sector: ev.sector,
            geography: ev.geography
          }))
        });
      } catch (error) {
        console.error("Failed to fetch analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "confidence-high";
      case "medium":
        return "confidence-medium";
      case "low":
        return "confidence-low";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-full h-full border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground font-display font-bold uppercase tracking-widest text-sm">
            Tuning Intelligence...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-24 bg-muted/20 border-2 border-dashed rounded-3xl">
          <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-display font-black mb-4 uppercase tracking-tight">No analysis found</h2>
          <Link to="/analyze">
            <Button size="lg" className="rounded-2xl">Run New Analysis</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <Link to="/analyze">
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-muted/50 hover:bg-primary/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-black text-foreground tracking-tight uppercase leading-none mb-1">
                {t("report_title")}
              </h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t("report_desc")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-2xl border-border/60 font-bold bg-card/50">
              Share Report
            </Button>
            <Button className="rounded-2xl font-bold shadow-lg shadow-primary/20">
              Download PDF
            </Button>
          </div>
        </div>

        {/* Global Score Card */}
        <div className="card-elevated overflow-hidden border-none shadow-glow bg-card/40 backdrop-blur-xl relative group">
          <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none group-hover:bg-primary/[0.04] transition-colors" />
          <div className="gradient-accent p-1 h-1.5 w-full" />
          <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-transparent relative z-10">
            <div className="flex items-start gap-8 max-w-3xl">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] gradient-accent flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30 relative animate-slide-up">
                <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground relative z-10" />
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-display font-black text-foreground tracking-tight uppercase">
                    {data.startup.name}
                  </h2>
                  <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] uppercase py-1 shadow-inner">
                    {t("analysis_completed")}
                  </Badge>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/70 font-medium leading-relaxed bg-muted/30 p-5 rounded-2xl border border-border/40">
                  <ReactMarkdown>{data.startup.description}</ReactMarkdown>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Badge variant="secondary" className="px-4 py-1.5 text-xs font-bold rounded-xl border border-border/20">
                    <Building2 className="w-3.5 h-3.5 mr-2 text-primary" />
                    {data.startup.sector}
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-1.5 text-xs font-bold rounded-xl border border-border/20">
                    <Target className="w-3.5 h-3.5 mr-2 text-primary" />
                    {data.startup.stage}
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-1.5 text-xs font-bold rounded-xl border border-border/20">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-primary" />
                    {data.startup.geography}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col items-center lg:items-center justify-center gap-8 bg-muted/60 p-8 rounded-[2.5rem] border border-border/40 backdrop-blur-md min-w-[200px] shadow-inner">
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-widest opacity-60">
                  {t("fit_score")}
                </p>
                <div className="relative inline-block">
                  <p className="text-7xl font-display font-black text-foreground tracking-tighter leading-none">
                    {data.score}<span className="text-3xl text-primary opacity-50">%</span>
                  </p>
                </div>
              </div>
              <Badge
                variant={getConfidenceColor(data.confidence)}
                className="text-[11px] px-5 py-2 shadow-lg border-none font-black uppercase tracking-widest animate-pulse"
              >
                {data.confidence === "high" && <CheckCircle className="w-3.5 h-3.5 mr-2" />}
                {data.confidence} {t("confidence")}
              </Badge>
            </div>
          </div>
        </div>


        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-black text-foreground flex items-center gap-3 uppercase tracking-tight">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                {t("recommended_investors")}
              </h3>
              <Badge variant="outline" className="font-bold border-border/60">
                Top {data.investors.length} Matches
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {data.investors.map((investor: any, idx: number) => (
                <div key={investor.id} className="card-interactive p-7 flex flex-col animate-slide-up bg-card/40 border-border/40 group overflow-hidden relative" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-display font-black text-2xl text-primary border border-primary/20 shadow-lg shadow-primary/5 group-hover:rotate-6 transition-transform">
                        {investor.logo}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-foreground leading-tight uppercase tracking-tight">
                          {investor.name}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {investor.focus.slice(0, 2).map((f: string) => (
                            <Badge
                              key={f}
                              variant="outline"
                              className="text-[9px] font-black uppercase tracking-widest py-0.5 px-2 bg-card/60 backdrop-blur-sm border-border/60"
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-display font-black text-primary leading-none tracking-tighter">
                        {investor.fitScore}<span className="text-sm opacity-50">%</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-60">
                        {t("match")}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-border/60 relative z-10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary/60" />
                      {t("key_reasons")}
                    </p>
                    {investor.reasons.map((reason: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                        <div className="text-foreground/80 font-medium leading-relaxed prose-xs prose-p:m-0">
                          <ReactMarkdown>{reason}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="card-elevated p-0 overflow-hidden bg-emerald-950/[0.03] border-emerald-500/10">
              <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/10 flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-500" />
                <h3 className="font-display font-black text-foreground uppercase tracking-tight text-sm">
                  {t("why_fits")}
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-5">
                  {data.whyFits.length > 0 ? (
                    data.whyFits.map((reason: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 text-sm animate-slide-in-right" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="text-foreground/80 font-bold leading-relaxed prose prose-sm dark:prose-invert prose-p:m-0">
                          <ReactMarkdown>{reason}</ReactMarkdown>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground italic flex items-center gap-2 font-medium">
                      <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                      Synthesizing strategic fits...
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className={`card-elevated p-0 overflow-hidden ${data.whyDoesNotFit.length > 0 ? 'bg-orange-950/[0.03] border-orange-500/10' : 'bg-muted/30 border-dashed opacity-60'}`}>
              <div className={`p-4 border-b flex items-center gap-3 ${data.whyDoesNotFit.length > 0 ? 'bg-orange-500/10 border-orange-500/10' : 'bg-muted/50 border-border/40'}`}>
                {data.whyDoesNotFit.length > 0 ? (
                  <XCircle className="w-5 h-5 text-orange-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                <h3 className="font-display font-black text-foreground uppercase tracking-tight text-sm">
                  {t("considerations")}
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-5">
                  {data.whyDoesNotFit.length > 0 ? (
                    data.whyDoesNotFit.map((reason: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 text-sm animate-slide-in-right" style={{ animationDelay: `${i * 150}ms` }}>
                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <XCircle className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <div className="text-foreground/80 font-bold leading-relaxed prose prose-sm dark:prose-invert prose-p:m-0">
                          <ReactMarkdown>{reason}</ReactMarkdown>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground font-medium flex items-start gap-4">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <span>{t("no_risks_found") || "No significant misalignments detected for this configuration."}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>


        <Collapsible open={evidenceOpen} onOpenChange={setEvidenceOpen}>
          <CollapsibleTrigger asChild>
            <div className="card-interactive p-8 cursor-pointer group hover:bg-info/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center border border-info/10 group-hover:scale-110 transition-all">
                    <FileText className="w-7 h-7 text-info" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-black text-foreground uppercase tracking-tight">
                      {t("evidence")} Repository
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      Verified Data Points: {data.evidence.length} {t("sources_used")}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center group-hover:bg-info/10 transition-colors">
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-500 ${evidenceOpen ? "rotate-180" : ""
                      }`}
                  />
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-8 space-y-4 animate-slide-up">
            {data.evidence.map((item: any, i: number) => {
              const itmType = item.type?.toLowerCase() || 'news';
              const colorClass = itmType === 'news' ? 'text-primary bg-primary/10 border-primary/20' : itmType === 'policy' ? 'text-info bg-info/10 border-info/20' : 'text-warning bg-warning/10 border-warning/20';

              return (
                <div
                  key={i}
                  className="card-elevated p-0 overflow-hidden bg-card/40 border-border/40 group hover:border-info/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row min-h-[140px]">
                    <div className="w-full md:w-16 bg-muted/40 flex md:flex-col items-center justify-center gap-4 py-4 md:border-r border-border/40 group-hover:bg-info/[0.02]">
                      <div className="text-[10px] font-black text-muted-foreground/40 rotate-0 md:rotate-90 uppercase tracking-widest">
                        {item.date || 2024}
                      </div>
                    </div>

                    <div className="flex-1 p-6 md:p-8">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge className={`font-black text-[10px] uppercase py-0.5 px-2 shadow-none border ${colorClass}`}>
                              {item.type}
                            </Badge>
                            {item.geography && (
                              <Badge variant="outline" className="font-black text-[10px] uppercase py-0.5 flex items-center gap-1 border-border/60">
                                <Globe className="w-3 h-3 opacity-60" /> {item.geography}
                              </Badge>
                            )}
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                              via {item.source}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-lg font-black text-foreground uppercase tracking-tight group-hover:text-info transition-colors">
                              {item.title}
                            </h4>
                            <div className="mt-3 p-4 bg-info/5 rounded-xl border border-info/10">
                              <p className="text-[10px] font-black text-info uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Core Inference
                              </p>
                              <p className="text-sm font-bold text-foreground/70 leading-relaxed">
                                {item.relevance}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-12 h-12 rounded-2xl bg-muted/30 hover:bg-info hover:text-white transition-all duration-300 shrink-0 border border-border/10"
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
            })}
          </CollapsibleContent>
        </Collapsible>


        <div className="flex flex-col sm:flex-row gap-5 justify-center py-6">
          <Link to="/analyze">
            <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 font-bold border-border/60 hover:bg-muted transition-all bg-card shadow-sm">
              <ArrowLeft className="w-5 h-5 mr-2 opacity-60" />
              {t("run_new")}
            </Button>
          </Link>
          <Link to="/evidence">
            <Button size="lg" className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              {t("view_evidence")}
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
