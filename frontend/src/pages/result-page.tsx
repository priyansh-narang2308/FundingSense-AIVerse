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
            relevance: ev.usage_reason
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">No analysis found</h2>
          <Link to="/analyze">
            <Button>Run New Analysis</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/analyze">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("report_title")}
            </h1>
            <p className="text-muted-foreground">
              {t("report_desc")}
            </p>
          </div>
        </div>


        <div className="card-elevated overflow-hidden border-none shadow-glow">
          <div className="gradient-accent p-1 h-1.5 w-full" />
          <div className="p-8 pb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-card">
            <div className="flex items-start gap-6 max-w-3xl">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 rotate-3 animate-fade-in">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    {data.startup.name}
                  </h2>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {t("analysis_completed")}
                  </Badge>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-2 leading-relaxed">
                  <ReactMarkdown>{data.startup.description}</ReactMarkdown>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                    {data.startup.sector}
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    <Target className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                    {data.startup.stage}
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                    {data.startup.geography}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-row lg:flex-col items-center lg:items-end gap-6 bg-muted/30 p-6 rounded-2xl border border-border/50">
              <div className="text-center lg:text-right">
                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  {t("fit_score")}
                </p>
                <div className="relative inline-block">
                  <p className="text-6xl font-display font-extrabold text-foreground tracking-tighter">
                    {data.score}%
                  </p>
                </div>
              </div>
              <Badge
                variant={getConfidenceColor(data.confidence)}
                className="text-sm px-4 py-1.5 shadow-sm border-none font-bold"
              >
                {data.confidence === "high" && <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                {data.confidence.toUpperCase()} {t("confidence")}
              </Badge>
            </div>
          </div>
        </div>


        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              {t("recommended_investors")}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.investors.map((investor: any, idx: number) => (
                <div key={investor.id} className="card-interactive p-6 flex flex-col animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-display font-bold text-xl text-primary border border-primary/10 shadow-sm">
                        {investor.logo}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground leading-none">
                          {investor.name}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {investor.focus.slice(0, 2).map((f: string) => (
                            <Badge
                              key={f}
                              variant="outline"
                              className="text-[10px] uppercase tracking-wider py-0 px-1.5 opacity-70"
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-display font-black text-primary leading-none">
                        {investor.fitScore}%
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">
                        {t("match")}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-auto pt-4 border-t border-border/50">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("key_reasons")}</p>
                    {investor.reasons.map((reason: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="text-foreground/80 leading-snug prose-xs prose-p:m-0">
                          <ReactMarkdown>{reason}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-elevated p-6 bg-success/5 border-success/20">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-success" />
                {t("why_fits")}
              </h3>
              <ul className="space-y-4">
                {data.whyFits.length > 0 ? (
                  data.whyFits.map((reason: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm animate-slide-in-right" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                      </div>
                      <div className="text-foreground/90 font-medium leading-relaxed prose prose-sm dark:prose-invert prose-p:m-0">
                        <ReactMarkdown>{reason}</ReactMarkdown>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground italic flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Analyzing fit factors...
                  </li>
                )}
              </ul>
            </div>

            <div className={`card-elevated p-6 ${data.whyDoesNotFit.length > 0 ? 'bg-warning/5 border-warning/20' : 'bg-muted/30 border-dashed opacity-80'}`}>
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                {data.whyDoesNotFit.length > 0 ? (
                  <XCircle className="w-5 h-5 text-warning" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
                {t("considerations")}
              </h3>
              <ul className="space-y-4">
                {data.whyDoesNotFit.length > 0 ? (
                  data.whyDoesNotFit.map((reason: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm animate-slide-in-right" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center shrink-0 mt-0.5">
                        <XCircle className="w-3.5 h-3.5 text-warning" />
                      </div>
                      <div className="text-foreground/90 font-medium leading-relaxed prose prose-sm dark:prose-invert prose-p:m-0">
                        <ReactMarkdown>{reason}</ReactMarkdown>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground italic flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                    </div>
                    <span>{t("no_risks_found") || "No significant risks or misalignments identified based on the provided data."}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>


        <Collapsible open={evidenceOpen} onOpenChange={setEvidenceOpen}>
          <CollapsibleTrigger asChild>
            <div className="card-interactive p-6 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      {t("evidence")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data.evidence.length} {t("sources_used")}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${evidenceOpen ? "rotate-180" : ""
                    }`}
                />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="card-elevated divide-y divide-border">
              {data.evidence.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="shrink-0">
                      {item.type}
                    </Badge>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.source} • {item.date}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">{t("used_for")}:</span>{" "}
                        {item.relevance}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => item.url && window.open(item.url, '_blank')}
                    disabled={!item.url}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>


        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/analyze">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4" />
              {t("run_new")}
            </Button>
          </Link>
          <Link to="/evidence">
            <Button variant="default" size="lg">
              {t("view_evidence")}
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
