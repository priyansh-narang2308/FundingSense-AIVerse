import { useState, useEffect } from "react";
import { Search, ShieldCheck, Database, FileText, Sparkles, Wand2, Globe } from "lucide-react";
import { Progress } from "./ui/progress";

const steps = [
  { id: 1, text: "Initializing RAG orchestrator...", icon: Search },
  { id: 2, text: "Executing semantic vector search...", icon: Database },
  { id: 3, text: "Scanning internal knowledge base...", icon: ShieldCheck },
  { id: 4, text: "Triggering real-time generative crawl...", icon: Globe },
  { id: 5, text: "Cross-referencing verified facts...", icon: FileText },
  { id: 6, text: "Synthesizing investor fit report...", icon: Sparkles },
  { id: 7, text: "Finalizing localized response...", icon: Wand2 },
];

export function LoadingModal({ isOpen }: { isOpen: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
      setProgress((prev) => {
        if (prev < 98) return prev + Math.random() * 15;
        return prev;
      });
    }, 800); // Faster, more natural progression

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-8 card-elevated border-2 border-primary/20 shadow-glow space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">AI Multi-Source Analysis</h2>
          <p className="text-muted-foreground">Executing RAG-authenticated retrieval across verified data sources.</p>
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="space-y-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              
              return (
                <div 
                  key={step.id} 
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    isCurrent ? "text-primary translate-x-1" : isPast ? "text-muted-foreground/60" : "text-muted-foreground/30"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isCurrent ? "animate-spin-slow" : ""}`} />
                  <span className={`text-sm font-medium ${isCurrent ? "font-semibold" : ""}`}>
                    {step.text}
                  </span>
                  {isPast && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-success/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-success" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
          <p className="text-xs text-muted-foreground">
            Integrating latest market intelligence and investor thesis alignment...
          </p>
        </div>
      </div>
    </div>
  );
}
