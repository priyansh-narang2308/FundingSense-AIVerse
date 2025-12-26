import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useLanguage } from "../contexts/LanguageContext";
import { chatWithAI, getHistory, getChatMessages, type AnalysisResponse } from "../services/api";
import { supabase } from "../utils/supabase";
import {
    Send,
    Bot,
    User as UserIcon,
    Loader2,
    ExternalLink,
    MessageSquare,
    Sparkles,
    History,
    Info,
    Languages,
    TrendingUp,
    Globe
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: { title: string; url?: string; source_name: string }[];
}

export default function ChatPage() {
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
    const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("");
    const [user, setUser] = useState<any>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchHistory(currentUser.id);
                fetchChatHistory(currentUser.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchHistory(currentUser.id);
                fetchChatHistory(currentUser.id);
            } else {
                setMessages([]);
                setAnalyses([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const fetchHistory = async (userId: string) => {
        try {
            const data = await getHistory(userId);
            setAnalyses(data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const fetchChatHistory = async (userId: string) => {
        try {
            const history = await getChatMessages(userId);
                                const formattedHistory: Message[] = history.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
                sources: msg.sources || []
            }));
            setMessages(formattedHistory);
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        const newMessages: Message[] = [
            ...messages,
            { role: "user", content: userMessage }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await chatWithAI({
                message: userMessage,
                analysis_id: selectedAnalysisId || undefined,
                language: language,
                user_id: user?.id,
                chat_history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
            });

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: response.answer,
                    sources: response.sources
                }
            ]);
        } catch (error: any) {
            toast({
                title: "Chat error",
                description: error.message || "Failed to get a response. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-6xl mx-auto px-4">
                <div className="flex flex-row items-center justify-between gap-4 py-4 border-b border-border/40 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground tracking-tight leading-none mb-1">
                                {t("q_and_a")}
                            </h1>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                {t("chat_with_ai")}
                            </p>
                        </div>
                    </div>

                    <div className="w-64">
                        <Select value={selectedAnalysisId} onValueChange={setSelectedAnalysisId}>
                            <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-border/40 hover:border-primary/20 transition-all text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <History className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <SelectValue placeholder={t("select_context")} />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/60 shadow-2xl p-1 min-w-[200px]">
                                {analyses.length > 0 ? (
                                    analyses.map((analysis) => (
                                        <SelectItem
                                            key={analysis.analysis_id}
                                            value={analysis.analysis_id}
                                            className="rounded-lg hover:bg-slate-50 focus:text-black focus:bg-slate-50"
                                        >
                                            <div className="flex flex-col py-0.5">
                                                <span className="font-bold text-xs truncate max-w-[180px] text-foreground">{analysis.startup_summary.slice(0, 40)}...</span>
                                                <span className="text-[9px] text-muted-foreground opacity-60">
                                                    {analysis.metadata.sector} • {analysis.metadata.stage}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-xs font-bold">{t("no_startups_yet")}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{t("keep_dreaming")}</p>
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 bg-card/10 rounded-3xl border border-border/40 overflow-hidden shadow-inner">
                    <ScrollArea ref={scrollRef} className="flex-1 px-4 md:px-8 py-6">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
                                        <Bot className="w-8 h-8 text-primary opacity-70" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-foreground">
                                            Ready to scale?
                                        </h3>
                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                                            Ask about your venture, market trends, or funding. I support 8+ Indic languages.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mt-8">
                                        {[
                                            { q: "What are the top 3 VCs for my sector?", icon: TrendingUp },
                                            { q: "Summarize recent funding trends in India.", icon: Globe },
                                            { q: "Is my current stage ready for Series A?", icon: Sparkles },
                                            { q: "Analyze the regulatory impact locally.", icon: Info }
                                        ].map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setInput(suggestion.q)}
                                                className="p-4 rounded-xl bg-card border border-border/60 text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/[0.02] transition-all text-left flex items-center gap-3"
                                            >
                                                <suggestion.icon className="w-3.5 h-3.5 opacity-60" />
                                                {suggestion.q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex flex-col w-full",
                                        message.role === "user" ? "items-end" : "items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "flex items-center gap-2 mb-1.5 px-2",
                                        message.role === "user" ? "flex-row-reverse" : ""
                                    )}>
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg flex items-center justify-center text-[10px]",
                                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-zinc-800 text-white"
                                        )}>
                                            {message.role === "user" ? <UserIcon className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground opacity-60">
                                            {message.role === "user" ? "Founder" : "FundingSense"}
                                        </span>
                                    </div>

                                    <div className={cn(
                                        "p-4 md:p-5 rounded-2xl text-sm leading-relaxed shadow-sm border prose prose-sm max-w-full",
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground border-primary/20 rounded-tr-none prose-invert"
                                            : "bg-card border-border/40 text-foreground rounded-tl-none dark:prose-invert"
                                    )}>
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </div>

                                    {message.sources && message.sources.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5 px-2">
                                            {message.sources.map((source, sIdx) => (
                                                <a
                                                    key={sIdx}
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/40 text-[9px] font-bold text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                                                >
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                    {source.title.slice(0, 30)}...
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex flex-col items-start w-full">
                                    <div className="flex items-center gap-2 mb-1.5 px-2">
                                        <div className="w-6 h-6 rounded-lg bg-zinc-800 text-white flex items-center justify-center">
                                            <Bot className="w-3 h-3" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-primary animate-pulse">
                                            Analyzing...
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-2xl rounded-tl-none bg-card border border-border/40 min-w-[80px]">
                                        <div className="flex gap-1">
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 md:p-6 bg-background/50 border-t border-border/40 backdrop-blur-sm">
                        <div className="max-w-4xl mx-auto relative">
                            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/60 shadow-lg focus-within:border-primary/40 transition-all">
                                <Input
                                    className="flex-1 bg-transparent border-none py-4 px-4 h-auto text-sm focus-visible:ring-0 placeholder:text-muted-foreground/40 font-medium"
                                    placeholder={t("type_message")}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg p-0 transition-transform active:scale-95"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-6 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                                <div className="flex items-center gap-1.5">
                                    <Info className="w-2.5 h-2.5" />
                                    Grounded Search
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Languages className="w-2.5 h-2.5" />
                                    Multilingual
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Gemini 2.0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
