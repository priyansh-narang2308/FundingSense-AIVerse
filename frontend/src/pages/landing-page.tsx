/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  CheckCircle,
  Globe,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  LogOut,
  Settings as SettingsIcon,
  Star,
  Layers,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { getStats } from "../services/api";
import { supabase } from "../utils/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { motion, useScroll, useTransform } from "motion/react";

const features = [
  {
    icon: CheckCircle,
    title: "Evidence-Backed Decisions",
    description:
      "Every recommendation is backed by real funding data, policy documents, and market intelligence.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Full support for Indic languages, making funding intelligence accessible to founders across India.",
  },
  {
    icon: Lightbulb,
    title: "Explainable AI Insights",
    description:
      "Understand exactly why a funding outcome is predicted. No black boxes, complete transparency.",
  },
];

const benefits = [
  {
    icon: BarChart3,
    title: "Investor Matching",
    description:
      "Find investors whose portfolio and thesis align with your startup.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Understand potential rejection reasons before you pitch.",
  },
  {
    icon: Zap,
    title: "Fast Insights",
    description: "Get actionable funding intelligence in minutes, not weeks.",
  },
];

const GridBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div 
      className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]" 
    />
    <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-primary/15 via-emerald-500/5 to-transparent" />
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-30 animate-blob" />
    <div className="absolute top-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000" />
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    total_analyses: "1,240+",
    total_investors: "850+",
    avg_score: "82%",
  });

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    getStats()
      .then((data) => {
        if (data.total_analyses > 0) {
          setStats({
            total_analyses: data.total_analyses.toLocaleString() + "+",
            total_investors: data.total_investors.toString() + "+",
            avg_score: data.avg_score,
          });
        }
      })
      .catch(() => console.log("Stats fetch failed, using defaults"));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <GridBackground />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50"
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl md:text-2xl font-display font-bold text-foreground tracking-tight">
              Funding<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Sense</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="hidden sm:block">
                  <Button variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium transition-all duration-200">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 p-0 overflow-hidden transition-all duration-200"
                    >
                      <Avatar className="h-full w-full">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.email}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-primary text-xs font-bold font-display">
                          {user.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground">Account</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer transition-colors duration-150">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors duration-150"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium transition-all duration-200">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-primary to-emerald-500 hover:shadow-lg hover:shadow-primary/30 text-white shadow-lg shadow-primary/20 rounded-full px-6 font-semibold transition-all duration-200 hover:scale-105">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-48 pb-28 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              style={{ opacity, scale }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 text-left"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-emerald-500/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:border-primary/50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                V2.0 Now Live
              </motion.div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-foreground leading-[1] text-balance">
                The Next Gen of<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-primary animate-pulse">
                  Funding Intelligence
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-light">
                Unlock deep, evidence-backed AI insights derived from millions of 
                real-world funding data points. Stop guessing. Start closing.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                <Link to={user ? "/analyze" : "/signup"}>
                  <Button size="xl" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-primary to-emerald-500 hover:shadow-2xl hover:shadow-primary/40 text-white shadow-xl shadow-primary/25 group px-10 py-6 text-lg font-semibold transition-all duration-200 hover:scale-105">
                    Analyze Your Funding Fit
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-emerald-500/20 to-primary/30 blur-[120px] rounded-full scale-75 animate-pulse" />
              <div className="relative z-10 w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-primary/30 border border-primary/20 hover:shadow-primary/50 transition-all duration-500">
                <img 
                  src="/funding_hero.png" 
                  alt="Funding Insight Abstract" 
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-x-4 bottom-4 glass rounded-2xl p-6 border border-white/30 shadow-xl backdrop-blur-md">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <Layers className="w-4 h-4 text-primary" />
                        Live Analysis
                      </div>
                      <div className="text-xs bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                        94% ACCURACY
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                         <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 2, delay: 1 }}
                          className="h-full bg-gradient-to-r from-primary to-emerald-500" 
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-medium opacity-70 uppercase tracking-widest">
                        <span>Data Scraped</span>
                        <span>Processed</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

 


      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary/80">Capabilities</h2>
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-display font-bold text-foreground"
            >
              Everything You Need to Scale
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              We leverage advanced RAG architectures and deep market intelligence 
              to give you the edge in every pitch meeting.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -15, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-125 transition-transform duration-300 shadow-lg shadow-primary/10">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-muted/40 to-muted/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary/80">The Process</h2>
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-display font-bold text-foreground"
            >
              Three Steps to Funding Clarity
            </motion.h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-6 relative">
             {/* Connection Line */}
            <div className="absolute top-[44px] left-[30px] right-[30px] h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 rounded-full hidden md:block" />
            
            {[
              { 
                step: "01", 
                title: "Data Ingestion", 
                desc: "Securely upload your pitch deck or sync your startup profile.",
                icon: Layers
              },
              { 
                step: "02", 
                title: "AI Analysis", 
                desc: "Our models compare your data against millions of funding events.",
                icon: Zap
              },
              { 
                step: "03", 
                title: "Match & Close", 
                desc: "Receive actionable insights and matched investor lists.",
                icon: Star
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 text-center space-y-6 group"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/30 shadow-xl mx-auto flex items-center justify-center text-2xl font-black text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-emerald-500 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-110">
                   <item.icon className="w-10 h-10" />
                </div>
                <div>
                   <div className="text-xs font-bold text-primary/80 mb-2 uppercase tracking-widest">Step {item.step}</div>
                   <h4 className="text-2xl font-display font-bold mb-3 text-foreground">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed px-4 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-gradient-to-r from-foreground to-foreground text-background overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <GridBackground />
        </div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                Stop Sending Cold <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                  Emails.
                </span><br />
                Start Building Relationships.
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 p-5 rounded-2xl hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-emerald-500/30 flex items-center justify-center group-hover:from-primary/50 group-hover:to-emerald-500/50 group-hover:scale-110 transition-all duration-300">
                      <benefit.icon className="w-6 h-6 text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{benefit.title}</h4>
                      <p className="text-background/80">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/50 via-emerald-500/50 to-primary/50 blur-[100px] rounded-full opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/20 rounded-3xl p-10 shadow-2xl backdrop-blur-xl hover:shadow-primary/30 transition-all duration-300">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-400/20 flex items-center justify-center hover:scale-110 transition-transform">
                      <Zap className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-lg text-white">Predictive Score v2</h5>
                      <p className="text-zinc-400 text-sm">Target Analysis: Vertex Ventures</p>
                    </div>
                 </div>
                 
                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <span className="text-zinc-300 font-medium">Match Probability</span>
                       <span className="text-emerald-400 font-bold text-xl">92%</span>
                    </div>
                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "92%" }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)] rounded-full" 
                        />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                       {[
                         { label: "Thesis Fit", val: "High" },
                         { label: "Check Size", val: "Optimal" },
                         { label: "Portfolio", val: "Unique" },
                       ].map((item, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, y: 10 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ delay: 0.6 + i * 0.1 }}
                           className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/50 p-4 rounded-xl border border-white/10 text-center hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                         >
                            <div className="text-[10px] text-zinc-400 uppercase mb-2 font-bold tracking-wider">{item.label}</div>
                            <div className="text-sm font-bold text-emerald-400">{item.val}</div>
                         </motion.div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full opacity-30 animate-blob" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full opacity-30 animate-blob animation-delay-2000" />
        </div>
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[40px] bg-gradient-to-br from-primary via-emerald-500 to-primary p-12 md:p-24 text-center text-white shadow-2xl shadow-primary/50 relative overflow-hidden border border-primary/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            
            <div className="relative z-10 space-y-10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-display font-bold leading-tight"
              >
                Ready to understand your <br />
                <span className="underline decoration-white/40 underline-offset-8 hover:decoration-white/70 transition-all duration-300">funding landscape?</span>
              </motion.h2>
          
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
              >
                <Link to={user ? "/analyze" : "/signup"}>
                  <Button size="xl" className="w-full sm:w-auto bg-white text-primary hover:bg-zinc-50 hover:shadow-xl hover:shadow-white/20 rounded-full px-12 py-7 font-bold shadow-xl group text-lg transition-all duration-200 hover:scale-105">
                    Start Free Analysis
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-24 px-6 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-1 md:col-span-2 space-y-6"
            >
              <Link to="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-display font-bold text-foreground">
                  FundingSense
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                The world's most advanced funding intelligence platform powered by 
                explainable AI and deep market data.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-bold mb-6 text-foreground uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center">Features</Link></li>
                <li><Link to="/investors" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center">Investors</Link></li>
                <li><Link to="/pricing" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center">Pricing</Link></li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-bold mb-6 text-foreground uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center">About</Link></li>
                <li><Link to="/contact" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center">Privacy Policy</Link></li>
              </ul>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-border/30 gap-6"
          >
            <p className="text-sm text-muted-foreground">
              © 2025 FundingSense AI. Built for the next generation of founders.
            </p>
            <div className="flex items-center gap-6">
            </div>
          </motion.div>
        </div>
      </footer>

      <style>{`
        .glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
        }
        .dark .glass {
          background: rgba(0, 0, 0, 0.75);
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes shine {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .shine {
          animation: shine 3s infinite;
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  );
}
