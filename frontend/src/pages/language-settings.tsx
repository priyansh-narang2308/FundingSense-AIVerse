/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Globe, Check, Save, Sparkles, Languages } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../hooks/use-toast";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const languages = [
  { value: "en", label: "English", native: "English", flag: "🇺🇸" },
  { value: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { value: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { value: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { value: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { value: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { value: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { value: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
] as const;

export default function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage();
  const [uiLanguage, setUiLanguage] = useState(language);
  const [reportLanguage, setReportLanguage] = useState("en");
  const { toast } = useToast();

  const handleSave = () => {
    setLanguage(uiLanguage as any);

    // Programmatic trigger for Google Translate
    try {
      const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (googleCombo) {
        googleCombo.value = uiLanguage;
        googleCombo.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn("Google Translate trigger failed:", e);
    }

    toast({
      title: t("save_prefs"),
      description: "Full-page translation engine has been re-synchronized.",
      className: "bg-primary text-primary-foreground border-none shadow-xl rounded-2xl",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-12 pb-12"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-black text-foreground tracking-tight uppercase">
                {t("language_settings")}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-primary" />
                {t("interface_desc")}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2 font-bold">
            <Save className="w-5 h-5" />
            {t("save_prefs")}
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Interface Selection Grid */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Languages className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold text-foreground">
                {t("interface_lang")}
              </h2>
            </div>

            <RadioGroup
              value={uiLanguage}
              onValueChange={setUiLanguage as any}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {languages.map((lang) => (
                <motion.label
                  key={lang.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300",
                    uiLanguage === lang.value
                      ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5"
                      : "border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card"
                  )}
                >
                  <RadioGroupItem value={lang.value} className="sr-only" />
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm transition-all duration-300",
                    uiLanguage === lang.value ? "bg-white dark:bg-zinc-800 scale-110" : "bg-muted/50"
                  )}>
                    {lang.flag}
                  </div>
                  <div className="text-center">
                    <p className="font-black text-foreground uppercase tracking-tighter text-sm">{lang.label}</p>
                    <p className="text-[10px] text-muted-foreground font-bold opacity-60">{lang.native}</p>
                  </div>

                  {uiLanguage === lang.value && (
                    <motion.div
                      layoutId="choice-check"
                      className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
                    </motion.div>
                  )}
                </motion.label>
              ))}
            </RadioGroup>
          </motion.div>

          {/* Sidebar Settings */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Report Strategy Card */}
            <div className="bg-card border border-border/60 rounded-[2.5rem] p-8 space-y-8 shadow-sm relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

              <div className="space-y-2 relative">
                <h3 className="text-lg font-display font-bold text-foreground tracking-tight underline-offset-4 decoration-primary/30">
                  {t("report_lang")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("report_lang_selection_desc")}
                </p>
              </div>

              <div className="space-y-4">
                <Select value={reportLanguage} onValueChange={setReportLanguage}>
                  <SelectTrigger className="w-full h-14 rounded-2xl bg-background border-border/60 focus:ring-primary/20">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/80 rounded-2xl shadow-2xl">
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value} className="rounded-xl my-1 mx-2">
                        <span className="flex items-center gap-3">
                          <span className="text-xl">{lang.flag}</span>
                          <span className="font-bold text-sm tracking-tight">{lang.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Info */}
              <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {t("localization_tech")}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  {t("localization_tech_desc")}
                </p>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-8 rounded-[2.5rem] bg-foreground text-background shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite]" />
              <div className="relative space-y-3">
                <h4 className="font-black text-primary uppercase tracking-tighter text-lg">
                  {t("did_you_know")}
                </h4>
                <p className="text-xs text-background/70 leading-relaxed font-bold">
                  {t("did_you_know_desc")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </DashboardLayout>
  );
}
